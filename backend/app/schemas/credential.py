"""Credential schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CredentialCreate(BaseModel):
    student_id: UUID
    category: str  # ACADEMIC, INTERNSHIP, EVENT, CLUB, RESEARCH
    title: str = Field(..., max_length=500)
    description: str | None = None
    metadata: dict = {}
    expires_at: datetime | None = None


class CredentialUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    metadata: dict | None = None
    change_reason: str | None = None


class CredentialResponse(BaseModel):
    id: UUID
    institution_id: UUID
    student_id: UUID
    category: str
    title: str
    description: str | None = None
    metadata: dict = {}
    current_version: int
    payload_hash: str
    signature: str
    signing_key_id: UUID
    status: str
    issued_at: datetime
    expires_at: datetime | None = None
    issued_by: UUID
    is_public: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CredentialVersionResponse(BaseModel):
    id: UUID
    credential_id: UUID
    version: int
    payload: dict
    payload_hash: str
    signature: str
    signing_key_id: UUID
    change_reason: str | None = None
    created_by: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class CredentialVerifyRequest(BaseModel):
    credential_id: UUID
    payload_hash: str
    signature: str


class CredentialVerifyResponse(BaseModel):
    valid: bool
    credential: dict | None = None
    institution: dict | None = None
    signature_valid: bool = False


class VisibilityUpdate(BaseModel):
    is_public: bool


class RevokeRequest(BaseModel):
    reason: str
