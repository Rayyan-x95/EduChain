"""JWT creation/validation and password hashing."""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password ───────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── Token Data ─────────────────────────────────────────────
class TokenData(BaseModel):
    user_id: uuid.UUID
    institution_id: uuid.UUID
    user_type: str
    status: str
    token_type: str = "access"


# ── JWT ────────────────────────────────────────────────────
def create_access_token(
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
    user_type: str,
    status: str,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iss": "edulink",
        "aud": "edulink-api",
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
        "jti": str(uuid.uuid4()),
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> TokenData | None:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            audience="edulink-api",
        )
        if payload.get("type") != "access":
            return None
        return TokenData(
            user_id=uuid.UUID(payload["sub"]),
            institution_id=uuid.UUID(payload["institution_id"]),
            user_type=payload["user_type"],
            status=payload["status"],
            token_type="access",
        )
    except (JWTError, KeyError, ValueError):
        return None


def decode_refresh_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None
