"""Audit Log repository."""
import uuid
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditLogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, log: AuditLog) -> AuditLog:
        self.db.add(log)
        await self.db.flush()
        return log

    async def list_by_institution(
        self,
        institution_id: uuid.UUID,
        action: str | None = None,
        actor_id: uuid.UUID | None = None,
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> list[AuditLog]:
        query = (
            select(AuditLog)
            .where(AuditLog.institution_id == institution_id)
            .order_by(AuditLog.created_at.desc())
        )
        if action:
            query = query.where(AuditLog.action == action)
        if actor_id:
            query = query.where(AuditLog.actor_id == actor_id)
        if from_date:
            query = query.where(AuditLog.created_at >= from_date)
        if to_date:
            query = query.where(AuditLog.created_at <= to_date)

        result = await self.db.execute(query.offset(offset).limit(limit))
        return list(result.scalars().all())

    async def count_by_institution(
        self, institution_id: uuid.UUID, action: str | None = None
    ) -> int:
        query = select(func.count()).select_from(AuditLog).where(
            AuditLog.institution_id == institution_id
        )
        if action:
            query = query.where(AuditLog.action == action)
        result = await self.db.execute(query)
        return result.scalar_one()
