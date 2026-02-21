"""Auth routes: register, login, refresh, logout."""
import logging
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, CurrentUser, _extract_token
from app.core.redis import add_token_to_blocklist
from app.config import settings
from jose import jwt
import redis.asyncio as redis
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.common import SuccessResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=SuccessResponse, status_code=201)
async def register(body: RegisterRequest, db: DBSession):
    svc = AuthService(db)
    result = await svc.register(body)
    return SuccessResponse(message=result["message"], data={"user_id": result["user_id"]})


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, body: LoginRequest, db: DBSession):
    svc = AuthService(db)
    dpop_header = request.headers.get("DPoP")
    result = await svc.login(body, dpop_header)
    return result


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: DBSession):
    svc = AuthService(db)
    result = await svc.refresh_token(body.refresh_token)
    return result


@router.post("/logout", response_model=SuccessResponse)
async def logout(user: CurrentUser, token: str = Depends(_extract_token)):
    jti = None
    exp = None
    try:
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        jti = unverified_payload.get("jti")
        exp = unverified_payload.get("exp")
        if jti and exp:
            import time
            expires_in = int(exp - time.time())
            if expires_in > 0:
                await add_token_to_blocklist(jti, expires_in)
    except jwt.DecodeError as e:
        import hashlib
        safe_token = hashlib.sha256(token.encode()).hexdigest()[:8]
        logger.warning(f"Failed to decode token during logout: {e}. Token hash: {safe_token}")
    except redis.RedisError as e:
        logger.error(f"Redis error during logout for jti={jti}, exp={exp}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during logout")
    except Exception as e:
        logger.error(f"Critical error during logout for jti={jti}, exp={exp}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during logout")
    return SuccessResponse(message="Logged out successfully.")
