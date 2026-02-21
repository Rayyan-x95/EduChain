"""Institution routes."""
from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, DBSession, PlatformAdmin
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionResponse,
    InstitutionUpdate,
    PublicKeyResponse,
)
from app.services.institution_service import InstitutionService
from app.services.key_management_service import KeyManagementService

router = APIRouter(prefix="/institutions", tags=["Institutions"])


@router.get("/", response_model=list[InstitutionResponse])
async def list_institutions(db: DBSession, offset: int = 0, limit: int = 20):
    svc = InstitutionService(db)
    return await svc.list_institutions(offset, limit)


@router.post("/", response_model=InstitutionResponse, status_code=201)
async def create_institution(
    body: InstitutionCreate,
    admin: PlatformAdmin,
    db: DBSession,
):
    svc = InstitutionService(db)
    return await svc.create(body)


@router.get("/{slug}", response_model=InstitutionResponse)
async def get_institution(slug: str, db: DBSession):
    svc = InstitutionService(db)
    return await svc.get_by_slug(slug)


@router.patch("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: UUID,
    body: InstitutionUpdate,
    admin: PlatformAdmin,
    db: DBSession,
):
    svc = InstitutionService(db)
    return await svc.update(institution_id, body)


@router.get("/{institution_id}/public-keys", response_model=list[PublicKeyResponse])
async def list_public_keys(institution_id: UUID, db: DBSession):
    svc = KeyManagementService(db)
    keys = await svc.list_keys(institution_id)
    return [
        PublicKeyResponse(
            key_id=k.id,
            algorithm=k.algorithm,
            public_key_pem=k.public_key_pem,
            fingerprint=k.key_fingerprint,
            status=k.status,
            created_at=k.created_at,
        )
        for k in keys
    ]
