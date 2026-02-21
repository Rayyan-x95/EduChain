"""User repository."""
import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str, institution_id: uuid.UUID) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.email == email,
                User.institution_id == institution_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_enrollment(
        self, enrollment_number: str, institution_id: uuid.UUID
    ) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.enrollment_number == enrollment_number,
                User.institution_id == institution_id,
            )
        )
        return result.scalar_one_or_none()

    async def count_students(self, institution_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(User).where(
                User.institution_id == institution_id,
                User.user_type == "STUDENT",
            )
        )
        return result.scalar_one()

    async def search_verified_students(
        self,
        institution_id: uuid.UUID | None = None,
        program: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> list[User]:
        query = select(User).where(
            User.status == "VERIFIED",
            User.user_type == "STUDENT",
        )
        if institution_id:
            query = query.where(User.institution_id == institution_id)
        if program:
            query = query.where(User.program.ilike(f"%{program}%"))
        query = query.offset(offset).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_status(self, institution_id: uuid.UUID, status: str) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(User).where(
                User.institution_id == institution_id,
                User.status == status,
                User.user_type == "STUDENT",
            )
        )
        return result.scalar_one()
