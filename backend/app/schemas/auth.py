"""Auth schemas."""
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    enrollment_number: str | None = None
    program: str | None = None
    academic_year: str | None = None
    department: str | None = None
    institution_slug: str
    consent_terms: bool = True
    consent_privacy: bool = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    institution_slug: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserBasic(BaseModel):
    id: UUID
    full_name: str
    email: str
    user_type: str
    status: str
    institution_id: UUID

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserBasic


class RefreshRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    institution_slug: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
