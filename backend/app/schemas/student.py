"""Student schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class StudentProfile(BaseModel):
    id: UUID
    full_name: str
    email: str
    enrollment_number: str | None = None
    program: str | None = None
    academic_year: str | None = None
    department: str | None = None
    user_type: str
    status: str
    email_verified: bool
    verified_at: datetime | None = None
    avatar_url: str | None = None
    phone: str | None = None
    institution_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class StudentUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = Field(None, max_length=20)
    avatar_url: str | None = None


class IDCardResponse(BaseModel):
    student_name: str
    institution_name: str
    program: str | None = None
    academic_year: str | None = None
    enrollment_number: str | None = None
    status: str
    verification_timestamp: datetime | None = None
    avatar_url: str | None = None


class StatusUpdateRequest(BaseModel):
    status: str  # VERIFIED, REJECTED, SUSPENDED, etc.
    reason: str | None = None
