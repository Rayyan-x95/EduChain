"""Institution schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class InstitutionCreate(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    domain: str | None = None
    logo_url: str | None = None
    website: str | None = None
    address: str | None = None
    country: str | None = None
    tier: str = "free"


class InstitutionUpdate(BaseModel):
    name: str | None = None
    domain: str | None = None
    logo_url: str | None = None
    website: str | None = None
    address: str | None = None
    country: str | None = None
    tier: str | None = None
    max_students: int | None = None
    settings: dict | None = None


class InstitutionResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    domain: str | None = None
    logo_url: str | None = None
    website: str | None = None
    address: str | None = None
    country: str | None = None
    tier: str
    max_students: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicKeyResponse(BaseModel):
    key_id: UUID
    algorithm: str
    public_key_pem: str
    fingerprint: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
