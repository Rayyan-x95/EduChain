"""Appeal service: submit, review, enforce one-appeal & 24h rules."""
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    AppealAlreadySubmittedError,
    AppealWindowExpiredError,
    NotFoundError,
    ValidationError,
)
from app.models.appeal import Appeal
from app.models.user import User
from app.repositories.appeal_repository import AppealRepository
from app.repositories.user_repository import UserRepository
from app.schemas.appeal import AppealReview, AppealSubmit
from app.services.audit_service import AuditService


class AppealService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.appeal_repo = AppealRepository(db)
        self.user_repo = UserRepository(db)
        self.audit_service = AuditService(db)

    async def submit(self, student: User, data: AppealSubmit) -> Appeal:
        # 1. Student must be REJECTED
        if student.status != "REJECTED":
            raise ValidationError("Appeals are only allowed for rejected students.")

        # 2. Check 24h window
        if student.updated_at:
            deadline = student.updated_at + timedelta(hours=24)
            if datetime.now(timezone.utc) > deadline:
                raise AppealWindowExpiredError()

        # 3. One appeal per student
        existing = await self.appeal_repo.get_by_student(student.id, student.institution_id)
        if existing:
            raise AppealAlreadySubmittedError()

        # 4. Create appeal
        now = datetime.now(timezone.utc)
        appeal = Appeal(
            id=uuid.uuid4(),
            institution_id=student.institution_id,
            student_id=student.id,
            reason=data.reason,
            supporting_doc_url=data.supporting_document,
            status="SUBMITTED",
            submitted_at=now,
            appeal_deadline=now + timedelta(hours=24),
        )
        await self.appeal_repo.create(appeal)

        # Update student status
        student.status = "APPEAL_SUBMITTED"
        await self.db.flush()

        await self.audit_service.log(
            institution_id=student.institution_id,
            actor_id=student.id,
            action="APPEAL_SUBMITTED",
            target_type="appeal",
            target_id=appeal.id,
        )

        return appeal

    async def review(
        self,
        appeal_id: uuid.UUID,
        institution_id: uuid.UUID,
        data: AppealReview,
        reviewer: User,
    ) -> Appeal:
        appeal = await self.appeal_repo.get_by_id_and_institution(appeal_id, institution_id)
        if not appeal:
            raise NotFoundError("Appeal", str(appeal_id))

        appeal.status = data.status
        appeal.reviewed_by = reviewer.id
        appeal.reviewed_at = datetime.now(timezone.utc)
        appeal.review_notes = data.review_notes

        # Update student status based on outcome
        student = await self.user_repo.get_by_id(appeal.student_id)
        if student:
            if data.status == "APPROVED":
                student.status = "PENDING"  # Re-enters verification queue
            elif data.status == "REJECTED":
                student.status = "FINAL_REJECTED"

        await self.db.flush()

        action = "APPEAL_APPROVED" if data.status == "APPROVED" else "APPEAL_REJECTED"
        await self.audit_service.log(
            institution_id=institution_id,
            actor_id=reviewer.id,
            action=action,
            target_type="appeal",
            target_id=appeal.id,
            details={"review_notes": data.review_notes},
        )

        return appeal

    async def get_student_appeal(self, student: User) -> Appeal | None:
        return await self.appeal_repo.get_by_student(student.id, student.institution_id)

    async def list_pending(self, institution_id: uuid.UUID) -> list[Appeal]:
        return await self.appeal_repo.list_pending(institution_id)
