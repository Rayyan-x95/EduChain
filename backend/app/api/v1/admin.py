"""Admin routes: dashboard, roles, keys, audit, reputation override."""
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Query

from app.api.deps import DBSession, InstitutionAdmin, PlatformAdmin
from app.schemas.admin import (
    AuditLogResponse,
    DashboardStats,
    KeyGenerateResponse,
    ReputationOverride,
    RoleAssign,
)
from app.schemas.common import SuccessResponse
from app.services.audit_service import AuditService
from app.services.key_management_service import KeyManagementService
from app.services.reputation_service import ReputationService
from app.repositories.user_repository import UserRepository
from app.repositories.credential_repository import CredentialRepository
from app.repositories.appeal_repository import AppealRepository
from app.repositories.endorsement_repository import EndorsementRepository

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(admin: InstitutionAdmin, db: DBSession):
    user_repo = UserRepository(db)
    cred_repo = CredentialRepository(db)
    appeal_repo = AppealRepository(db)
    endorsement_repo = EndorsementRepository(db)

    inst = admin.institution_id
    counts = await user_repo.count_by_status(inst)
    total_creds = await cred_repo.count_active(inst)
    pending_appeals = await appeal_repo.count_pending(inst)
    total_endorsements = await endorsement_repo.count_by_institution(inst)

    return DashboardStats(
        total_students=sum(counts.values()),
        verified_students=counts.get("VERIFIED", 0),
        pending_students=counts.get("PENDING", 0),
        total_credentials=total_creds,
        active_credentials=total_creds,
        pending_appeals=pending_appeals,
        total_endorsements=total_endorsements,
    )


@router.post("/roles", response_model=SuccessResponse)
async def assign_role(body: RoleAssign, admin: InstitutionAdmin, db: DBSession):
    from app.models.role import Role
    import uuid as uuid_mod

    role = Role(
        id=uuid_mod.uuid4(),
        institution_id=admin.institution_id,
        user_id=body.user_id,
        role=body.role,
        assigned_by=admin.id,
    )
    db.add(role)
    await db.flush()

    audit_svc = AuditService(db)
    await audit_svc.log(
        institution_id=admin.institution_id,
        actor_id=admin.id,
        action="ROLE_ASSIGNED",
        target_type="role",
        target_id=role.id,
        details={"role": body.role, "user_id": str(body.user_id)},
    )
    return SuccessResponse(message=f"Role '{body.role}' assigned.")


@router.post("/keys/generate", response_model=KeyGenerateResponse)
async def generate_key(admin: InstitutionAdmin, db: DBSession):
    svc = KeyManagementService(db)
    key = await svc.generate_key(admin.institution_id, admin)
    return KeyGenerateResponse(
        key_id=key.id,
        algorithm=key.algorithm,
        fingerprint=key.key_fingerprint,
        status=key.status,
        public_key_pem=key.public_key_pem,
        created_at=key.created_at,
    )


@router.post("/keys/rotate", response_model=KeyGenerateResponse)
async def rotate_key(admin: InstitutionAdmin, db: DBSession):
    svc = KeyManagementService(db)
    key = await svc.rotate_key(admin.institution_id, admin)
    return KeyGenerateResponse(
        key_id=key.id,
        algorithm=key.algorithm,
        fingerprint=key.key_fingerprint,
        status=key.status,
        public_key_pem=key.public_key_pem,
        created_at=key.created_at,
    )


@router.post("/reputation/{user_id}/override", response_model=SuccessResponse)
async def override_reputation(
    user_id: UUID,
    body: ReputationOverride,
    admin: InstitutionAdmin,
    db: DBSession,
):
    svc = ReputationService(db)
    await svc.override_modifier(
        user_id=user_id,
        institution_id=admin.institution_id,
        modifier=body.modifier,
        reason=body.reason,
        modified_by=admin.id,
    )
    return SuccessResponse(message="Reputation modifier updated.")


@router.get("/audit-logs", response_model=list[AuditLogResponse])
async def audit_logs(
    admin: InstitutionAdmin,
    db: DBSession,
    action: str | None = Query(None),
    from_date: datetime | None = Query(None),
    to_date: datetime | None = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    svc = AuditService(db)
    logs = await svc.query(
        institution_id=admin.institution_id,
        action=action,
        from_date=from_date,
        to_date=to_date,
        offset=offset,
        limit=limit,
    )
    return [AuditLogResponse.model_validate(l) for l in logs]
