"""Audit service: log all actions for compliance and traceability."""
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.repositories.audit_log_repository import AuditLogRepository


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AuditLogRepository(db)

    def _scrub_pii(self, data: dict) -> dict:
        """Remove PII from audit log details to comply with GDPR."""
        if not data:
            return {}
        scrubbed = data.copy()
        pii_keys = ["email", "full_name", "phone", "address", "national_id"]
        for key in pii_keys:
            if key in scrubbed:
                scrubbed[key] = "[REDACTED]"
        return scrubbed

    async def log(
        self,
        institution_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        action: str,
        target_type: str | None = None,
        target_id: uuid.UUID | None = None,
        details: dict | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            id=uuid.uuid4(),
            institution_id=institution_id,
            actor_id=actor_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=self._scrub_pii(details),
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.now(timezone.utc),
        )
        return await self.repo.create(entry)

    async def query(
        self,
        institution_id: uuid.UUID,
        action: str | None = None,
        actor_id: uuid.UUID | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> list[AuditLog]:
        return await self.repo.list_by_institution(
            institution_id=institution_id,
            action=action,
            actor_id=actor_id,
            from_date=from_date,
            to_date=to_date,
            offset=offset,
            limit=limit,
        )
