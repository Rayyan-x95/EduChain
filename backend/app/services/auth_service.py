"""Authentication service: register, login, email verify, password reset."""
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import (
    ConflictError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.consent import ConsentRecord
from app.models.user import User
from app.repositories.institution_repository import InstitutionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, UserBasic
from app.services.audit_service import AuditService


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.institution_repo = InstitutionRepository(db)
        self.audit_service = AuditService(db)

    async def register(self, data: RegisterRequest) -> dict:
        # 1. Resolve institution
        institution = await self.institution_repo.get_by_slug(data.institution_slug)
        if not institution:
            raise NotFoundError("Institution", data.institution_slug)

        # 2. Check student cap
        count = await self.user_repo.count_students(institution.id)
        if count >= institution.max_students:
            raise ValidationError("Institution has reached its student limit.")

        # 3. Check duplicate email
        existing = await self.user_repo.get_by_email(data.email, institution.id)
        if existing:
            raise ConflictError("Email already registered at this institution.")

        # 4. Check duplicate enrollment
        if data.enrollment_number:
            existing = await self.user_repo.get_by_enrollment(
                data.enrollment_number, institution.id
            )
            if existing:
                raise ConflictError("Enrollment number already registered.")

        # 5. Create user
        user = User(
            id=uuid.uuid4(),
            institution_id=institution.id,
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            enrollment_number=data.enrollment_number,
            program=data.program,
            academic_year=data.academic_year,
            department=data.department,
            user_type="STUDENT",
            status="PENDING",
        )
        await self.user_repo.create(user)

        # 6. Record consent
        for consent_type in ["terms_of_service", "privacy_policy"]:
            consent = ConsentRecord(
                id=uuid.uuid4(),
                institution_id=institution.id,
                user_id=user.id,
                consent_type=consent_type,
                version="1.0",
                accepted=True,
                accepted_at=datetime.now(timezone.utc),
            )
            self.db.add(consent)

        # 7. Audit log
        await self.audit_service.log(
            institution_id=institution.id,
            actor_id=user.id,
            action="USER_REGISTERED",
            target_type="user",
            target_id=user.id,
            details={"email": data.email},
        )

        return {
            "user_id": str(user.id),
            "email": user.email,
            "status": user.status,
            "message": "Verification email sent. Awaiting institution approval.",
        }

    async def login(self, data: LoginRequest) -> LoginResponse:
        # 1. Resolve institution
        institution = await self.institution_repo.get_by_slug(data.institution_slug)
        if not institution:
            raise NotFoundError("Institution", data.institution_slug)

        # 2. Find user
        user = await self.user_repo.get_by_email(data.email, institution.id)
        if not user:
            raise UnauthorizedError("Invalid email or password.")

        # 3. Verify password
        if not verify_password(data.password, user.password_hash):
            await self.audit_service.log(
                institution_id=institution.id,
                actor_id=user.id,
                action="USER_LOGIN_FAILED",
                target_type="user",
                target_id=user.id,
            )
            raise UnauthorizedError("Invalid email or password.")

        # 4. Check status
        if user.status in ("SUSPENDED", "BLACKLISTED"):
            raise UnauthorizedError("Account is suspended or blacklisted.")

        # 5. Generate tokens
        access_token = create_access_token(
            user_id=user.id,
            institution_id=institution.id,
            user_type=user.user_type,
            status=user.status,
        )
        refresh_token = create_refresh_token(user_id=user.id)

        # 6. Update last login
        user.last_login_at = datetime.now(timezone.utc)
        await self.db.flush()

        # 7. Audit
        await self.audit_service.log(
            institution_id=institution.id,
            actor_id=user.id,
            action="USER_LOGIN",
            target_type="user",
            target_id=user.id,
        )

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserBasic(
                id=user.id,
                full_name=user.full_name,
                email=user.email,
                user_type=user.user_type,
                status=user.status,
                institution_id=institution.id,
            ),
        )

    async def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_refresh_token(refresh_token)
        if not payload:
            raise UnauthorizedError("Invalid refresh token.")

        user_id = uuid.UUID(payload["sub"])
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedError("User not found.")

        access_token = create_access_token(
            user_id=user.id,
            institution_id=user.institution_id,
            user_type=user.user_type,
            status=user.status,
        )
        new_refresh = create_refresh_token(user_id=user.id)

        return {
            "access_token": access_token,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }
