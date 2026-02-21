"""Appeal routes: submit, review, list."""
from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.deps import CurrentUser, DBSession, InstitutionAdmin
from app.schemas.appeal import AppealResponse, AppealReview, AppealSubmit
from app.schemas.common import SuccessResponse
from app.services.appeal_service import AppealService

router = APIRouter(prefix="/appeals", tags=["Appeals"])


@router.post("/", response_model=AppealResponse, status_code=201)
async def submit_appeal(body: AppealSubmit, user: CurrentUser, db: DBSession):
    svc = AppealService(db)
    appeal = await svc.submit(user, body.reason, body.supporting_document)
    return appeal


@router.get("/me", response_model=list[AppealResponse])
async def my_appeals(user: CurrentUser, db: DBSession):
    svc = AppealService(db)
    appeals = await svc.get_student_appeals(user)
    return appeals


@router.get("/pending", response_model=list[AppealResponse])
async def list_pending(admin: InstitutionAdmin, db: DBSession):
    svc = AppealService(db)
    return await svc.list_pending(admin.institution_id)


@router.post("/{appeal_id}/review", response_model=SuccessResponse)
async def review_appeal(
    appeal_id: UUID,
    body: AppealReview,
    admin: InstitutionAdmin,
    db: DBSession,
):
    svc = AppealService(db)
    await svc.review(appeal_id, body.status, admin, body.review_notes)
    return SuccessResponse(message=f"Appeal {body.status.lower()}.")
