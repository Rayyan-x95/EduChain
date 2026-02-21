"""Community service: badges, leaderboard."""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.badge import Badge, UserBadge
from app.models.user import User
from app.repositories.reputation_repository import ReputationRepository
from app.schemas.community import BadgeResponse, LeaderboardEntry, UserBadgeResponse


class CommunityService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rep_repo = ReputationRepository(db)

    async def list_badges(self, institution_id: uuid.UUID) -> list[BadgeResponse]:
        result = await self.db.execute(
            select(Badge).where(Badge.institution_id == institution_id)
        )
        badges = result.scalars().all()
        return [
            BadgeResponse(
                id=b.id,
                name=b.name,
                description=b.description,
                icon_url=b.icon_url,
                criteria=b.criteria,
                created_at=b.created_at,
            )
            for b in badges
        ]

    async def list_user_badges(
        self, user_id: uuid.UUID, institution_id: uuid.UUID
    ) -> list[UserBadgeResponse]:
        result = await self.db.execute(
            select(UserBadge, Badge)
            .join(Badge, UserBadge.badge_id == Badge.id)
            .where(
                UserBadge.user_id == user_id,
                UserBadge.institution_id == institution_id,
            )
        )
        rows = result.all()
        return [
            UserBadgeResponse(
                badge_id=ub.badge_id,
                badge_name=badge.name,
                badge_description=badge.description,
                icon_url=badge.icon_url,
                awarded_at=ub.awarded_at,
            )
            for ub, badge in rows
        ]

    async def get_leaderboard(
        self, institution_id: uuid.UUID, limit: int = 20
    ) -> list[LeaderboardEntry]:
        scores = await self.rep_repo.top_scores(institution_id, limit)
        entries = []
        for rank, score in enumerate(scores, 1):
            user = score.user
            entries.append(
                LeaderboardEntry(
                    user_id=score.user_id,
                    full_name=user.full_name if user else "Unknown",
                    program=user.program if user else None,
                    total_score=float(score.total_score),
                    rank=rank,
                )
            )
        return entries
