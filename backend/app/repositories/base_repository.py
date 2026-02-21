"""Generic base repository with institution-scoped CRUD."""
import uuid
from typing import Any, Generic, Type, TypeVar

from sqlalchemy import func, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseRepository(Generic[ModelType]):
    """Generic CRUD repository with multi-tenant scoping."""

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id: uuid.UUID) -> ModelType | None:
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_by_id_and_institution(
        self, id: uuid.UUID, institution_id: uuid.UUID
    ) -> ModelType | None:
        result = await self.db.execute(
            select(self.model).where(
                self.model.id == id,
                self.model.institution_id == institution_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_institution(
        self,
        institution_id: uuid.UUID,
        offset: int = 0,
        limit: int = 20,
        filters: dict[str, Any] | None = None,
    ) -> list[ModelType]:
        query = select(self.model).where(self.model.institution_id == institution_id)
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    query = query.where(getattr(self.model, key) == value)
        query = query.offset(offset).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_institution(
        self, institution_id: uuid.UUID, filters: dict[str, Any] | None = None
    ) -> int:
        query = select(func.count()).select_from(self.model).where(
            self.model.institution_id == institution_id
        )
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key) and value is not None:
                    query = query.where(getattr(self.model, key) == value)
        result = await self.db.execute(query)
        return result.scalar_one()

    async def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update_fields(
        self, id: uuid.UUID, institution_id: uuid.UUID, **fields
    ) -> ModelType | None:
        await self.db.execute(
            update(self.model)
            .where(self.model.id == id, self.model.institution_id == institution_id)
            .values(**fields)
        )
        return await self.get_by_id_and_institution(id, institution_id)

    async def delete_by_id(self, id: uuid.UUID, institution_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            delete(self.model).where(
                self.model.id == id, self.model.institution_id == institution_id
            )
        )
        return result.rowcount > 0
