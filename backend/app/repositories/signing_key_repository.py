"""Signing Key repository."""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.signing_key import SigningKey
from app.repositories.base_repository import BaseRepository


class SigningKeyRepository(BaseRepository[SigningKey]):
    def __init__(self, db: AsyncSession):
        super().__init__(SigningKey, db)

    async def get_active_key(self, institution_id: uuid.UUID) -> SigningKey | None:
        result = await self.db.execute(
            select(SigningKey).where(
                SigningKey.institution_id == institution_id,
                SigningKey.status == "ACTIVE",
            )
        )
        return result.scalar_one_or_none()

    async def get_by_fingerprint(self, fingerprint: str) -> SigningKey | None:
        result = await self.db.execute(
            select(SigningKey).where(SigningKey.key_fingerprint == fingerprint)
        )
        return result.scalar_one_or_none()

    async def list_by_institution(
        self, institution_id: uuid.UUID, **kwargs
    ) -> list[SigningKey]:
        result = await self.db.execute(
            select(SigningKey)
            .where(SigningKey.institution_id == institution_id)
            .order_by(SigningKey.created_at.desc())
        )
        return list(result.scalars().all())
