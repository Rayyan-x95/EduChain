"""Audit routes: query immutable logs."""
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.api.deps import DBSession, InstitutionAdmin
from app.schemas.common import SuccessResponse
from app.services.audit_service import AuditService

from app.schemas.admin import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/logs", response_model=list[AuditLogResponse])
async def get_audit_logs(
    admin: InstitutionAdmin,
    db: DBSession,
    action: str | None = None,
    actor_id: UUID | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    svc = AuditService(db)
    logs = await svc.query(
        institution_id=admin.institution_id,
        action=action,
        actor_id=actor_id,
        from_date=from_date,
        to_date=to_date,
        offset=offset,
        limit=limit,
    )
    return [AuditLogResponse.model_validate(l) for l in logs]
