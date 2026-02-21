"""Audit service: log all actions for compliance and traceability."""
import hashlib
import json
import uuid
import typing
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.repositories.audit_log_repository import AuditLogRepository


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AuditLogRepository(db)

    def _scrub_pii_recursive(self, data: typing.Any) -> typing.Any:
        pii_keys_lower = {"email", "full_name", "phone", "address", "national_id"}
        if isinstance(data, dict):
            scrubbed = {}
            for k, v in data.items():
                if isinstance(k, str) and k.lower() in pii_keys_lower:
                    scrubbed[k] = "[REDACTED]"
                else:
                    scrubbed[k] = self._scrub_pii_recursive(v)
            return scrubbed
        elif isinstance(data, list):
            return [self._scrub_pii_recursive(item) for item in data]
        else:
            return data

    def _scrub_pii(self, data: dict) -> dict:
        """Remove PII from audit log details to comply with GDPR."""
        if not data:
            return {}
        return self._scrub_pii_recursive(data)

    async def _get_last_hash(self, institution_id: uuid.UUID) -> str | None:
        """Get the hash of the most recent audit log entry for the institution."""
        stmt = (
            select(AuditLog.current_hash)
            .where(AuditLog.institution_id == institution_id)
            .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
            .limit(1)
            .with_for_update()
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    def _calculate_hash(self, entry: AuditLog, previous_hash: str | None) -> str:
        """Calculate SHA-256 hash of the log entry combined with the previous hash."""
        payload = {
            "id": str(entry.id),
            "institution_id": str(entry.institution_id),
            "actor_id": str(entry.actor_id) if entry.actor_id else None,
            "action": entry.action,
            "target_type": entry.target_type,
            "target_id": str(entry.target_id) if entry.target_id else None,
            "details": entry.details,
            "ip_address": entry.ip_address,
            "user_agent": entry.user_agent,
            "created_at": entry.created_at.isoformat(),
            "previous_hash": previous_hash,
        }
        payload_str = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(payload_str.encode("utf-8")).hexdigest()

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
        # Use a nested transaction to ensure atomicity of the hash chain
        async with self.db.begin_nested():
            # Acquire an advisory lock keyed by institution_id to serialize writes
            # and prevent concurrent requests from both seeing previous_hash as None
            from sqlalchemy import text
            lock_key = institution_id.int % (2**63 - 1) # Postgres advisory lock takes a 64-bit int
            await self.db.execute(text(f"SELECT pg_advisory_xact_lock({lock_key})"))
            
            previous_hash = await self._get_last_hash(institution_id)
            
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
                previous_hash=previous_hash,
            )
            
            entry.current_hash = self._calculate_hash(entry, previous_hash)
            
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
