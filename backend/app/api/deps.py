"""API dependencies: current user, DB session, role checks."""
import uuid
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status
import json
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import TokenData, decode_access_token
from app.core.redis import is_token_blocklisted
from app.db.session import async_session
from app.models.user import User
from app.repositories.user_repository import UserRepository


async def get_db() -> AsyncSession:
    async with async_session() as session:
        async with session.begin():
            yield session


DBSession = Annotated[AsyncSession, Depends(get_db)]


async def _extract_token(request: Request) -> str:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    return auth.removeprefix("Bearer ").strip()


async def get_token_data(
    request: Request,
    token: str = Depends(_extract_token),
) -> TokenData:
    from jose import jwt
    from app.config import settings
    
    # Decode without verification first to get jti
    try:
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        jti = unverified_payload.get("jti")
        if jti:
            try:
                is_blocked = await is_token_blocklisted(jti)
                if is_blocked:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token has been revoked",
                    )
            except Exception as redis_err:
                # Fail-closed on Redis error
                import logging
                logging.error(f"Redis error checking token blocklist: {redis_err}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Authentication service temporarily unavailable",
                )
                
        # DPoP Validation
        if unverified_payload.get("dpop_bound"):
            # TODO: Implement full DPoP proof validation (RFC 9449)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="DPoP validation is not yet implemented for bound tokens",
            )
            
    except HTTPException:
        raise
    except Exception:
        pass # Let decode_access_token handle invalid tokens

    data = decode_access_token(token)
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return data


async def get_db_with_rls(
    db: AsyncSession = Depends(get_db),
    token_data: TokenData = Depends(get_token_data)
) -> AsyncSession:
    """Injects JWT claims into the Postgres session for RLS."""
    claims = {
        "sub": str(token_data.user_id),
        "role": token_data.role,
        "iss": "edulink"
    }
    await db.execute(
        text("SELECT set_config('request.jwt.claims', :claims, true)"),
        {"claims": json.dumps(claims)}
    )
    return db


RLSDBSession = Annotated[AsyncSession, Depends(get_db_with_rls)]


async def get_current_user(
    token_data: TokenData = Depends(get_token_data),
    db: AsyncSession = Depends(get_db_with_rls),
) -> User:
    repo = UserRepository(db)
    user = await repo.get_by_id(token_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.status in ("BLACKLISTED",):
        raise HTTPException(status_code=403, detail="Account is blacklisted")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db_with_rls),
) -> User | None:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    try:
        token_data = await get_token_data(request, token)
        repo = UserRepository(db)
        user = await repo.get_by_id(token_data.user_id)
        if user and user.status not in ("BLACKLISTED",):
            return user
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Error in get_current_user_optional: {e}")
    return None

CurrentUserOptional = Annotated[User | None, Depends(get_current_user_optional)]

async def verify_mobile_attestation(
    x_app_attestation: str = Header(None, description="Mobile App Attestation Token")
):
    """Verify that the request comes from a genuine, unmodified mobile app."""
    if not x_app_attestation:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing app attestation token. Request must originate from the official mobile app."
        )
    
    # In a real implementation, this would verify the token with Apple App Attest or Google Play Integrity API
    # For now, we just check if it's present and has a minimum length
    if len(x_app_attestation) < 32:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid app attestation token."
        )
    return x_app_attestation


def require_role(*allowed_types: str):
    """Dependency factory: require user_type to be one of allowed_types."""

    async def _check(user: User = Depends(get_current_user)):
        if user.user_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {', '.join(allowed_types)}",
            )
        return user

    return _check


def require_status(*allowed_statuses: str):
    """Dependency factory: require user status."""

    async def _check(user: User = Depends(get_current_user)):
        if user.status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account status '{user.status}' is not allowed for this action",
            )
        return user

    return _check


PlatformAdmin = Annotated[User, Depends(require_role("PLATFORM_ADMIN"))]
InstitutionAdmin = Annotated[User, Depends(require_role("PLATFORM_ADMIN", "INSTITUTION_ADMIN"))]
Student = Annotated[User, Depends(require_role("STUDENT"))]
