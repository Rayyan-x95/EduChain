"""JWT creation/validation and password hashing."""
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PROTECTED_CLAIMS = {"sub", "exp", "type", "jti", "iat", "iss", "aud", "institution_id", "user_type", "status", "emergency"}


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
    emergency: bool = False


# ── JWT ────────────────────────────────────────────────────
def create_access_token(
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
    user_type: str,
    status: str,
    expires_delta: timedelta | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    exp = now + expires_delta if expires_delta else now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "institution_id": str(institution_id),
        "user_type": user_type,
        "status": status,
        "iss": "edulink",
        "aud": "edulink-api",
        "iat": now,
        "exp": exp,
        "type": "access",
        "jti": str(uuid.uuid4()),
    }
    if extra_claims:
        for key, value in extra_claims.items():
            if key in PROTECTED_CLAIMS:
                logger.warning(f"Attempted to overwrite protected claim '{key}' in create_access_token. Ignoring.")
                continue
            payload[key] = value
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(
    user_id: uuid.UUID,
    institution_id: uuid.UUID,
    user_type: str,
    status: str,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "institution_id": str(institution_id),
        "user_type": user_type,
        "status": status,
        "iss": "edulink",
        "iat": now,
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    if extra_claims:
        for key, value in extra_claims.items():
            if key in PROTECTED_CLAIMS:
                logger.warning(f"Attempted to overwrite protected claim '{key}' in create_refresh_token. Ignoring.")
                continue
            payload[key] = value
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
            emergency=payload.get("emergency", False),
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
    except (JWTError, KeyError, ValueError):
        return None
