"""Appeal repository."""
import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appeal import Appeal
from app.repositories.base_repository import BaseRepository


class AppealRepository(BaseRepository[Appeal]):
    def __init__(self, db: AsyncSession):
        super().__init__(Appeal, db)

    async def get_by_student(
        self, student_id: uuid.UUID, institution_id: uuid.UUID
    ) -> Appeal | None:
        result = await self.db.execute(
            select(Appeal).where(
                Appeal.student_id == student_id,
                Appeal.institution_id == institution_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_pending(self, institution_id: uuid.UUID) -> list[Appeal]:
        result = await self.db.execute(
            select(Appeal).where(
                Appeal.institution_id == institution_id,
                Appeal.status.in_(["SUBMITTED", "UNDER_REVIEW"]),
            )
        )
        return list(result.scalars().all())

    async def count_pending(self, institution_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Appeal).where(
                Appeal.institution_id == institution_id,
                Appeal.status.in_(["SUBMITTED", "UNDER_REVIEW"]),
            )
        )
        return result.scalar_one()
