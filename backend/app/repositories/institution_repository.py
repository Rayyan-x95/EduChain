"""Institution repository."""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.institution import Institution
from app.repositories.base_repository import BaseRepository


class InstitutionRepository(BaseRepository[Institution]):
    def __init__(self, db: AsyncSession):
        super().__init__(Institution, db)

    async def get_by_slug(self, slug: str) -> Institution | None:
        result = await self.db.execute(
            select(Institution).where(Institution.slug == slug)
        )
        return result.scalar_one_or_none()

    async def list_active(self, offset: int = 0, limit: int = 20) -> list[Institution]:
        result = await self.db.execute(
            select(Institution)
            .where(Institution.is_active == True)
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())
