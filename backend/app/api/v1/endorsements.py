"""Endorsement routes."""
from fastapi import APIRouter, HTTPException, status
from uuid import UUID

from app.api.deps import CurrentUser, DBSession
from app.core.rate_limiter import rate_limiter
from app.schemas.endorsement import EndorsementCreate, EndorsementResponse
from app.services.endorsement_service import EndorsementService

router = APIRouter(prefix="/endorsements", tags=["Endorsements"])


@router.post("/", response_model=EndorsementResponse, status_code=201)
async def give_endorsement(body: EndorsementCreate, user: CurrentUser, db: DBSession):
    if await rate_limiter.check_endorsement_limit(str(user.id)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Endorsement limit exceeded (max 3 per day).",
        )
    svc = EndorsementService(db)
    e = await svc.give_endorsement(
        giver=user,
        receiver_id=body.receiver_id,
        message=body.message,
        skills=body.skills,
    )
    return EndorsementResponse(
        id=e.id,
        giver_id=e.giver_id,
        receiver_id=e.receiver_id,
        giver_name=user.full_name,
        message=e.message,
        skills=e.skills or [],
        created_at=e.created_at,
    )


@router.get("/received", response_model=list[EndorsementResponse])
async def list_received(user: CurrentUser, db: DBSession):
    svc = EndorsementService(db)
    return await svc.list_received(user.id)


@router.get("/given", response_model=list[EndorsementResponse])
async def list_given(user: CurrentUser, db: DBSession):
    svc = EndorsementService(db)
    return await svc.list_given(user.id)


@router.get("/user/{user_id}", response_model=list[EndorsementResponse])
async def list_user_endorsements(user_id: UUID, db: DBSession):
    svc = EndorsementService(db)
    return await svc.list_received(user_id)
