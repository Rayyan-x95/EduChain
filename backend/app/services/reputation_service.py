"""Reputation service: compute & recompute user reputation scores."""
import math
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import REPUTATION_WEIGHTS
from app.models.reputation import ReputationScore
from app.models.user import User
from app.repositories.credential_repository import CredentialRepository
from app.repositories.endorsement_repository import EndorsementRepository
from app.repositories.reputation_repository import ReputationRepository
from app.repositories.user_repository import UserRepository


class ReputationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rep_repo = ReputationRepository(db)
        self.user_repo = UserRepository(db)
        self.cred_repo = CredentialRepository(db)
        self.endorsement_repo = EndorsementRepository(db)

    async def compute_for_user(self, user: User) -> ReputationScore:
        """Compute full reputation score for a user."""
        # 1. Verification score (0-100)
        verification = self._compute_verification(user)

        # 2. Credential score
        cred_count = await self.cred_repo.count_by_student(user.id)
        credential = min(100, math.log(cred_count + 1, 2) * 20) if cred_count > 0 else 0

        # 3. Endorsement score
        endorsement_count = await self.endorsement_repo.count_received(user.id)
        endorsement = min(100, math.log(endorsement_count + 1, 2) * 25) if endorsement_count > 0 else 0

        # 4. Community score (badges, profile completeness)
        community = self._compute_community(user)

        # 5. GitHub score
        github = self._compute_github(user)

        # Get existing score for institution modifier
        existing = await self.rep_repo.get_by_user(user.id, user.institution_id)
        modifier = float(existing.institution_modifier) if existing else 0

        # Weighted total
        total = (
            verification * REPUTATION_WEIGHTS["verification"]
            + credential * REPUTATION_WEIGHTS["credential"]
            + endorsement * REPUTATION_WEIGHTS["endorsement"]
            + community * REPUTATION_WEIGHTS["community"]
            + github * REPUTATION_WEIGHTS["github"]
            + modifier
        )
        total = max(0, min(100, total))

        score = ReputationScore(
            id=existing.id if existing else uuid.uuid4(),
            institution_id=user.institution_id,
            user_id=user.id,
            verification_score=round(verification, 2),
            credential_score=round(credential, 2),
            endorsement_score=round(endorsement, 2),
            community_score=round(community, 2),
            github_score=round(github, 2),
            institution_modifier=modifier,
            total_score=round(total, 2),
            last_computed_at=datetime.now(timezone.utc),
        )

        return await self.rep_repo.upsert(score)

    def _compute_verification(self, user: User) -> float:
        status_scores = {
            "VERIFIED": 100,
            "PENDING": 20,
            "REJECTED": 0,
            "APPEAL_SUBMITTED": 10,
            "FINAL_REJECTED": 0,
            "SUSPENDED": 0,
            "BLACKLISTED": 0,
        }
        base = status_scores.get(user.status, 0)

        # Tenure bonus: +1 per month verified
        if user.verified_at:
            months = (datetime.now(timezone.utc) - user.verified_at).days / 30
            base = min(100, base + months * 1)

        return base

    def _compute_community(self, user: User) -> float:
        score = 0
        # Profile completeness
        if user.bio:
            score += 15
        if user.avatar_url:
            score += 10
        if user.phone:
            score += 5
        if user.email_verified:
            score += 20
        if user.program:
            score += 10
        if user.enrollment_number:
            score += 10
        return min(100, score)

    def _compute_github(self, user: User) -> float:
        if not user.github_username:
            return 0
        # Base score for having GitHub connected
        return 50  # Can be enhanced with actual GitHub API data

    async def override_modifier(
        self,
        user_id: uuid.UUID,
        institution_id: uuid.UUID,
        modifier: float,
        reason: str,
        modified_by: uuid.UUID,
    ) -> ReputationScore:
        existing = await self.rep_repo.get_by_user(user_id, institution_id)
        if not existing:
            # Create a basic score first
            user = await self.user_repo.get_by_id(user_id)
            if user:
                existing = await self.compute_for_user(user)

        if existing:
            existing.institution_modifier = max(-20, min(20, modifier))
            existing.modified_by = modified_by
            existing.modifier_reason = reason
            # Recompute total
            existing.total_score = (
                float(existing.verification_score) * REPUTATION_WEIGHTS["verification"]
                + float(existing.credential_score) * REPUTATION_WEIGHTS["credential"]
                + float(existing.endorsement_score) * REPUTATION_WEIGHTS["endorsement"]
                + float(existing.community_score) * REPUTATION_WEIGHTS["community"]
                + float(existing.github_score) * REPUTATION_WEIGHTS["github"]
                + modifier
            )
            existing.total_score = max(0, min(100, existing.total_score))
            await self.db.flush()

        return existing
