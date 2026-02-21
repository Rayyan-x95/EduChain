"""Recruiter schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RecruiterRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    company_name: str | None = None
    institution_slug: str


class RecruiterSearchParams(BaseModel):
    program: str | None = None
    skills: list[str] | None = None
    min_reputation: float | None = None
    institution_slug: str | None = None
    page: int = 1
    per_page: int = 20


class StudentSearchResult(BaseModel):
    id: UUID
    full_name: str
    program: str | None = None
    institution: str
    reputation_score: float | None = None
    top_skills: list[str] = []
    credential_count: int = 0
    endorsement_count: int = 0
    github_verified: bool = False

    model_config = {"from_attributes": True}


class BulkVerifyRequest(BaseModel):
    credential_ids: list[UUID]
