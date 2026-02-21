"""Admin schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class RoleAssign(BaseModel):
    user_id: UUID
    role: str  # SUPER_ADMIN, VERIFICATION_OFFICER, CREDENTIAL_OFFICER, VIEWER


class RoleRevoke(BaseModel):
    role_id: UUID


class KeyGenerateResponse(BaseModel):
    key_id: UUID
    algorithm: str
    fingerprint: str
    status: str
    public_key_pem: str
    created_at: datetime


class AuditLogResponse(BaseModel):
    id: UUID
    action: str
    actor_id: UUID | None = None
    actor_name: str | None = None
    target_type: str | None = None
    target_id: UUID | None = None
    details: dict = {}
    ip_address: str | None = None
    created_at: datetime
    previous_hash: str | None = None
    current_hash: str | None = None

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_students: int = 0
    verified_students: int = 0
    pending_students: int = 0
    total_credentials: int = 0
    active_credentials: int = 0
