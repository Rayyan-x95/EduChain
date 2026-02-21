"""Endorsement service with rate limiting."""
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, RateLimitError, ValidationError
from app.models.endorsement import Endorsement
from app.models.user import User
from app.repositories.endorsement_repository import EndorsementRepository
from app.repositories.user_repository import UserRepository
from app.schemas.endorsement import EndorsementCreate, EndorsementResponse
from app.services.audit_service import AuditService


class EndorsementService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.endorsement_repo = EndorsementRepository(db)
        self.user_repo = UserRepository(db)
        self.audit_service = AuditService(db)

    async def give_endorsement(
        self, giver: User, data: EndorsementCreate
    ) -> EndorsementResponse:
        # 1. Giver must be verified
        if giver.status != "VERIFIED":
            raise ValidationError("Only verified students can endorse others.")

        # 2. No self-endorsement
        if giver.id == data.receiver_id:
            raise ValidationError("Cannot endorse yourself.")

        # 3. Check receiver exists and is same institution
        receiver = await self.user_repo.get_by_id(data.receiver_id)
        if not receiver or receiver.institution_id != giver.institution_id:
            raise ValidationError("Receiver not found in your institution.")

        # 4. Check duplicate
        existing = await self.endorsement_repo.get_by_pair(
            giver.id, data.receiver_id, giver.institution_id
        )
        if existing:
            raise ConflictError("You have already endorsed this student.")

        # 5. Rate limit: 3 per day
        today_count = await self.endorsement_repo.count_today(giver.id)
        if today_count >= 3:
            raise RateLimitError("Endorsement rate limit reached. Maximum 3 endorsements per day.")

        # 6. Create
        endorsement = Endorsement(
            id=uuid.uuid4(),
            institution_id=giver.institution_id,
            giver_id=giver.id,
            receiver_id=data.receiver_id,
            message=data.message,
            skills=data.skills,
            created_at=datetime.now(timezone.utc),
        )
        await self.endorsement_repo.create(endorsement)

        await self.audit_service.log(
            institution_id=giver.institution_id,
            actor_id=giver.id,
            action="ENDORSEMENT_GIVEN",
            target_type="endorsement",
            target_id=endorsement.id,
            details={"receiver_id": str(data.receiver_id)},
        )

        return EndorsementResponse(
            id=endorsement.id,
            giver_id=giver.id,
            receiver_id=data.receiver_id,
            giver_name=giver.full_name,
            receiver_name=receiver.full_name,
            message=data.message,
            skills=data.skills,
            created_at=endorsement.created_at,
        )

    async def list_received(self, user: User) -> list[EndorsementResponse]:
        endorsements = await self.endorsement_repo.list_received(
            user.id, user.institution_id
        )
        results = []
        for e in endorsements:
            giver = await self.user_repo.get_by_id(e.giver_id)
            results.append(
                EndorsementResponse(
                    id=e.id,
                    giver_id=e.giver_id,
                    receiver_id=e.receiver_id,
                    giver_name=giver.full_name if giver else None,
                    receiver_name=user.full_name,
                    message=e.message,
                    skills=e.skills or [],
                    created_at=e.created_at,
                )
            )
        return results

    async def list_given(self, user: User) -> list[EndorsementResponse]:
        endorsements = await self.endorsement_repo.list_given(
            user.id, user.institution_id
        )
        results = []
        for e in endorsements:
            receiver = await self.user_repo.get_by_id(e.receiver_id)
            results.append(
                EndorsementResponse(
                    id=e.id,
                    giver_id=e.giver_id,
                    receiver_id=e.receiver_id,
                    giver_name=user.full_name,
                    receiver_name=receiver.full_name if receiver else None,
                    message=e.message,
                    skills=e.skills or [],
                    created_at=e.created_at,
                )
            )
        return results
