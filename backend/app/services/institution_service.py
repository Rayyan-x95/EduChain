"""Institution service."""
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.institution import Institution
from app.repositories.institution_repository import InstitutionRepository
from app.schemas.institution import InstitutionCreate, InstitutionUpdate


class InstitutionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = InstitutionRepository(db)

    async def create(self, data: InstitutionCreate) -> Institution:
        existing = await self.repo.get_by_slug(data.slug)
        if existing:
            raise ConflictError(f"Institution with slug '{data.slug}' already exists.")

        institution = Institution(
            id=uuid.uuid4(),
            name=data.name,
            slug=data.slug,
            domain=data.domain,
            logo_url=data.logo_url,
            website=data.website,
            address=data.address,
            country=data.country,
            tier=data.tier,
        )
        return await self.repo.create(institution)

    async def update(
        self, institution_id: uuid.UUID, data: InstitutionUpdate
    ) -> Institution:
        inst = await self.repo.get_by_id(institution_id)
        if not inst:
            raise NotFoundError("Institution", str(institution_id))

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(inst, field, value)
        await self.db.flush()
        return inst

    async def get_by_slug(self, slug: str) -> Institution:
        inst = await self.repo.get_by_slug(slug)
        if not inst:
            raise NotFoundError("Institution", slug)
        return inst

    async def list_institutions(
        self, offset: int = 0, limit: int = 20
    ) -> list[Institution]:
        return await self.repo.list_active(offset, limit)
