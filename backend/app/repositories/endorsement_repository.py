"""Endorsement repository."""
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.endorsement import Endorsement


class EndorsementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, endorsement: Endorsement) -> Endorsement:
        self.db.add(endorsement)
        await self.db.flush()
        await self.db.refresh(endorsement)
        return endorsement

    async def get_by_pair(
        self, giver_id: uuid.UUID, receiver_id: uuid.UUID, institution_id: uuid.UUID
    ) -> Endorsement | None:
        result = await self.db.execute(
            select(Endorsement).where(
                Endorsement.giver_id == giver_id,
                Endorsement.receiver_id == receiver_id,
                Endorsement.institution_id == institution_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_received(
        self, receiver_id: uuid.UUID, institution_id: uuid.UUID
    ) -> list[Endorsement]:
        result = await self.db.execute(
            select(Endorsement).where(
                Endorsement.receiver_id == receiver_id,
                Endorsement.institution_id == institution_id,
            )
        )
        return list(result.scalars().all())

    async def list_given(
        self, giver_id: uuid.UUID, institution_id: uuid.UUID
    ) -> list[Endorsement]:
        result = await self.db.execute(
            select(Endorsement).where(
                Endorsement.giver_id == giver_id,
                Endorsement.institution_id == institution_id,
            )
        )
        return list(result.scalars().all())

    async def count_received(self, receiver_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Endorsement).where(
                Endorsement.receiver_id == receiver_id,
            )
        )
        return result.scalar_one()

    async def count_today(self, giver_id: uuid.UUID) -> int:
        """Count endorsements given today by a user."""
        since = datetime.now(timezone.utc) - timedelta(days=1)
        result = await self.db.execute(
            select(func.count()).select_from(Endorsement).where(
                Endorsement.giver_id == giver_id,
                Endorsement.created_at >= since,
            )
        )
        return result.scalar_one()

    async def count_by_institution(self, institution_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Endorsement).where(
                Endorsement.institution_id == institution_id,
            )
        )
        return result.scalar_one()
