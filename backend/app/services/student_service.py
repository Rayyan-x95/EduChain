"""Student service: profile management, ID card, privacy settings."""
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.reputation_repository import ReputationRepository
from app.schemas.student import (
    IDCardResponse,
    PrivacySettings,
    PrivacyUpdate,
    StudentProfile,
    StudentUpdate,
    StatusUpdateRequest,
)
from app.services.audit_service import AuditService


class StudentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.reputation_repo = ReputationRepository(db)
        self.audit_service = AuditService(db)

    async def get_profile(self, user: User) -> StudentProfile:
        rep = await self.reputation_repo.get_by_user(user.id, user.institution_id)
        return StudentProfile(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            enrollment_number=user.enrollment_number,
            program=user.program,
            academic_year=user.academic_year,
            department=user.department,
            user_type=user.user_type,
            status=user.status,
            email_verified=user.email_verified,
            verified_at=user.verified_at,
            profile_visible=user.profile_visible,
            recruiter_opt_in=user.recruiter_opt_in,
            avatar_url=user.avatar_url,
            bio=user.bio,
            phone=user.phone,
            github_username=user.github_username,
            reputation_score=float(rep.total_score) if rep else None,
            institution_id=user.institution_id,
            created_at=user.created_at,
        )

    async def update_profile(self, user: User, data: StudentUpdate) -> StudentProfile:
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.bio is not None:
            user.bio = data.bio
        if data.phone is not None:
            user.phone = data.phone
        if data.avatar_url is not None:
            user.avatar_url = data.avatar_url
        await self.db.flush()
        return await self.get_profile(user)

    async def get_id_card(self, user: User) -> IDCardResponse:
        rep = await self.reputation_repo.get_by_user(user.id, user.institution_id)
        institution = user.institution
        return IDCardResponse(
            student_name=user.full_name,
            institution_name=institution.name if institution else "Unknown",
            program=user.program,
            academic_year=user.academic_year,
            enrollment_number=user.enrollment_number,
            status=user.status,
            verification_timestamp=user.verified_at,
            reputation_score=float(rep.total_score) if rep else None,
            avatar_url=user.avatar_url,
        )

    async def get_privacy(self, user: User) -> PrivacySettings:
        return PrivacySettings(
            profile_visible=user.profile_visible,
            recruiter_opt_in=user.recruiter_opt_in,
        )

    async def update_privacy(self, user: User, data: PrivacyUpdate) -> PrivacySettings:
        if data.profile_visible is not None:
            user.profile_visible = data.profile_visible
        if data.recruiter_opt_in is not None:
            user.recruiter_opt_in = data.recruiter_opt_in
        await self.db.flush()
        return await self.get_privacy(user)

    async def update_status(
        self, target_user_id: uuid.UUID, institution_id: uuid.UUID, data: StatusUpdateRequest, actor: User
    ) -> dict:
        target = await self.user_repo.get_by_id_and_institution(target_user_id, institution_id)
        if not target:
            raise NotFoundError("Student", str(target_user_id))

        old_status = target.status
        target.status = data.status

        if data.status == "VERIFIED":
            target.verified_at = datetime.now(timezone.utc)
            target.verified_by = actor.id
        elif data.status == "REJECTED":
            target.rejection_reason = data.reason

        await self.db.flush()

        # Map status to audit action
        action_map = {
            "VERIFIED": "STUDENT_APPROVED",
            "REJECTED": "STUDENT_REJECTED",
            "SUSPENDED": "STUDENT_SUSPENDED",
            "BLACKLISTED": "STUDENT_BLACKLISTED",
        }
        action = action_map.get(data.status, "STUDENT_APPROVED")

        await self.audit_service.log(
            institution_id=institution_id,
            actor_id=actor.id,
            action=action,
            target_type="user",
            target_id=target.id,
            details={"old_status": old_status, "new_status": data.status, "reason": data.reason},
        )

        return {
            "user_id": str(target.id),
            "new_status": target.status,
            "rejection_reason": target.rejection_reason,
            "appeal_eligible": data.status == "REJECTED",
            "appeal_deadline": (
                str(datetime.now(timezone.utc).replace(hour=23, minute=59))
                if data.status == "REJECTED"
                else None
            ),
        }

    async def get_student_by_id(
        self, student_id: uuid.UUID, institution_id: uuid.UUID, requester: User
    ) -> StudentProfile | None:
        student = await self.user_repo.get_by_id_and_institution(student_id, institution_id)
        if not student:
            raise NotFoundError("Student", str(student_id))

        # Visibility check for non-admins
        if requester.user_type == "RECRUITER" and not student.recruiter_opt_in:
            raise ForbiddenError("Student has not opted in for recruiter visibility.")

        return await self.get_profile(student)
