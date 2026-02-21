"""Credential repository."""
import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credential import Credential, CredentialVersion
from app.repositories.base_repository import BaseRepository


class CredentialRepository(BaseRepository[Credential]):
    def __init__(self, db: AsyncSession):
        super().__init__(Credential, db)

    async def list_by_student(
        self, student_id: uuid.UUID, institution_id: uuid.UUID
    ) -> list[Credential]:
        result = await self.db.execute(
            select(Credential).where(
                Credential.student_id == student_id,
                Credential.institution_id == institution_id,
            )
        )
        return list(result.scalars().all())

    async def get_by_hash(self, payload_hash: str) -> Credential | None:
        result = await self.db.execute(
            select(Credential).where(Credential.payload_hash == payload_hash)
        )
        return result.scalar_one_or_none()

    async def count_active(self, institution_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Credential).where(
                Credential.institution_id == institution_id,
                Credential.status == "ACTIVE",
            )
        )
        return result.scalar_one()

    async def count_by_student(self, student_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Credential).where(
                Credential.student_id == student_id,
            )
        )
        return result.scalar_one()

    async def create_version(self, version: CredentialVersion) -> CredentialVersion:
        self.db.add(version)
        await self.db.flush()
        await self.db.refresh(version)
        return version

    async def list_versions(self, credential_id: uuid.UUID) -> list[CredentialVersion]:
        result = await self.db.execute(
            select(CredentialVersion)
            .where(CredentialVersion.credential_id == credential_id)
            .order_by(CredentialVersion.version.desc())
        )
        return list(result.scalars().all())
