"""Reputation repository."""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reputation import ReputationScore


class ReputationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user(
        self, user_id: uuid.UUID, institution_id: uuid.UUID
    ) -> ReputationScore | None:
        result = await self.db.execute(
            select(ReputationScore).where(
                ReputationScore.user_id == user_id,
                ReputationScore.institution_id == institution_id,
            )
        )
        return result.scalar_one_or_none()

    async def upsert(self, score: ReputationScore) -> ReputationScore:
        existing = await self.get_by_user(score.user_id, score.institution_id)
        if existing:
            existing.verification_score = score.verification_score
            existing.credential_score = score.credential_score
            existing.endorsement_score = score.endorsement_score
            existing.community_score = score.community_score
            existing.github_score = score.github_score
            existing.total_score = score.total_score
            existing.last_computed_at = score.last_computed_at
            await self.db.flush()
            return existing
        self.db.add(score)
        await self.db.flush()
        await self.db.refresh(score)
        return score

    async def top_scores(
        self, institution_id: uuid.UUID, limit: int = 20
    ) -> list[ReputationScore]:
        result = await self.db.execute(
            select(ReputationScore)
            .where(ReputationScore.institution_id == institution_id)
            .order_by(ReputationScore.total_score.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
