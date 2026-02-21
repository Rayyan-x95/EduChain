"""Recruiter routes: search students, bulk verify."""
from uuid import UUID

from fastapi import APIRouter, Query, Depends

from app.api.deps import DBSession, Recruiter
from app.core.rate_limiter import RateLimiter
from app.schemas.recruiter import BulkVerifyRequest
from app.services.recruiter_service import RecruiterService

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])


@router.get("/search", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def search_students(
    recruiter: Recruiter,
    db: DBSession,
    program: str | None = Query(None),
    min_reputation: float | None = Query(None),
    institution_slug: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    svc = RecruiterService(db)
    return await svc.search_students(
        program=program,
        min_reputation=min_reputation,
        institution_slug=institution_slug,
        page=page,
        per_page=per_page,
    )


@router.post("/bulk-verify")
async def bulk_verify(
    body: BulkVerifyRequest,
    recruiter: Recruiter,
    db: DBSession,
):
    svc = RecruiterService(db)
    return await svc.bulk_verify(body.credential_ids)
