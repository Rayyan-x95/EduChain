"""Student routes: profile, ID card, privacy, status."""
from fastapi import APIRouter, Depends
from uuid import UUID

from app.api.deps import CurrentUser, DBSession, InstitutionAdmin
from app.schemas.student import (
    IDCardResponse,
    PrivacySettings,
    PrivacyUpdate,
    StatusUpdateRequest,
    StudentProfile,
    StudentUpdate,
)
from app.schemas.common import SuccessResponse
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/me", response_model=StudentProfile)
async def get_my_profile(user: CurrentUser, db: DBSession):
    svc = StudentService(db)
    return await svc.get_profile(user)


@router.patch("/me", response_model=StudentProfile)
async def update_my_profile(body: StudentUpdate, user: CurrentUser, db: DBSession):
    svc = StudentService(db)
    return await svc.update_profile(user, body)


@router.get("/me/id-card", response_model=IDCardResponse)
async def get_id_card(user: CurrentUser, db: DBSession):
    svc = StudentService(db)
    return await svc.get_id_card(user)


@router.get("/me/privacy", response_model=PrivacySettings)
async def get_privacy(user: CurrentUser, db: DBSession):
    svc = StudentService(db)
    return await svc.get_privacy(user)


@router.patch("/me/privacy", response_model=PrivacySettings)
async def update_privacy(body: PrivacyUpdate, user: CurrentUser, db: DBSession):
    svc = StudentService(db)
    return await svc.update_privacy(user, body)


@router.get("/{student_id}", response_model=StudentProfile)
async def get_student(student_id: UUID, user: CurrentUser, db: DBSession):
    svc = StudentService(db)
    return await svc.get_student_by_id(student_id, user)


@router.patch("/{student_id}/status", response_model=SuccessResponse)
async def update_student_status(
    student_id: UUID,
    body: StatusUpdateRequest,
    admin: InstitutionAdmin,
    db: DBSession,
):
    svc = StudentService(db)
    await svc.update_status(student_id, body.status, admin, body.reason)
    return SuccessResponse(message=f"Student status updated to {body.status}")
