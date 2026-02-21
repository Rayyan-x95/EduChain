"""Verification / QR schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class QRTokenResponse(BaseModel):
    qr_token: str
    short_code: str | None = None
    expires_at: datetime
    ttl_seconds: int


class QRValidateRequest(BaseModel):
    qr_token: str


class QRValidateResponse(BaseModel):
    valid: bool
    student: dict | None = None
    verification_timestamp: datetime | None = None
    signature_valid: bool = False
    reason: str | None = None
    code: str | None = None
