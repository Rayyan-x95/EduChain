"""Auth routes: register, login, refresh, logout."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DBSession, CurrentUser, _extract_token
from app.core.redis import add_token_to_blocklist
from app.config import settings
from jose import jwt
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


@router.post("/register", response_model=SuccessResponse, status_code=201)
async def register(body: RegisterRequest, db: DBSession):
    svc = AuthService(db)
    user = await svc.register(
        email=body.email,
        password=body.password,
        full_name=body.full_name,
        institution_slug=body.institution_slug,
        enrollment_number=body.enrollment_number,
        program=body.program,
        academic_year=body.academic_year,
        department=body.department,
    )
    return SuccessResponse(message="Registration successful. Pending verification.", data={"user_id": str(user.id)})


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: DBSession):
    svc = AuthService(db)
    result = await svc.login(body.email, body.password, body.institution_slug)
    return result


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: DBSession):
    svc = AuthService(db)
    result = await svc.refresh_token(body.refresh_token)
    return result


@router.post("/logout", response_model=SuccessResponse)
async def logout(user: CurrentUser, token: str = Depends(_extract_token)):
    try:
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        jti = unverified_payload.get("jti")
        exp = unverified_payload.get("exp")
        if jti and exp:
            import time
            expires_in = int(exp - time.time())
            if expires_in > 0:
                await add_token_to_blocklist(jti, expires_in)
    except Exception:
        pass
    return SuccessResponse(message="Logged out successfully.")
