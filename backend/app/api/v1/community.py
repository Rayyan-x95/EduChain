"""Community routes: reputation, badges, leaderboard."""
from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, DBSession
from app.schemas.community import (
    BadgeResponse,
    LeaderboardEntry,
    ReputationResponse,
    UserBadgeResponse,
)
from app.services.community_service import CommunityService
from app.services.reputation_service import ReputationService

router = APIRouter(prefix="/community", tags=["Community"])


@router.get("/reputation/me", response_model=ReputationResponse)
async def my_reputation(user: CurrentUser, db: DBSession):
    svc = ReputationService(db)
    score = await svc.compute_for_user(user)
    return ReputationResponse.model_validate(score)


@router.get("/reputation/{user_id}", response_model=ReputationResponse)
async def user_reputation(user_id: UUID, db: DBSession):
    from app.repositories.user_repository import UserRepository
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("User", str(user_id))
    svc = ReputationService(db)
    score = await svc.compute_for_user(user)
    return ReputationResponse.model_validate(score)


@router.get("/badges", response_model=list[BadgeResponse])
async def list_badges(user: CurrentUser, db: DBSession):
    svc = CommunityService(db)
    return await svc.list_badges(user.institution_id)


@router.get("/badges/me", response_model=list[UserBadgeResponse])
async def my_badges(user: CurrentUser, db: DBSession):
    svc = CommunityService(db)
    return await svc.list_user_badges(user.id, user.institution_id)


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(user: CurrentUser, db: DBSession, limit: int = 20):
    svc = CommunityService(db)
    return await svc.get_leaderboard(user.institution_id, limit)
