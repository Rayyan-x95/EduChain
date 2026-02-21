"""Authentication service: register, login, email verify, password reset."""
import uuid
from datetime import datetime, timedelta, timezone
import logging
import json

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import (
    ConflictError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)
from app.core.redis import redis_client
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

logger = logging.getLogger(__name__)

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

    async def login(self, data: LoginRequest, dpop_header: str | None = None) -> LoginResponse:
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
        extra_claims = {}
        if dpop_header:
            # TODO: Implement full DPoP proof validation (RFC 9449)
            # For now, we reject requests with DPoP headers to prevent unvalidated code paths
            raise UnauthorizedError("DPoP validation is not yet implemented")
            
        access_token = create_access_token(
            user_id=user.id,
            institution_id=institution.id,
            user_type=user.user_type,
            status=user.status,
            extra_claims=extra_claims,
        )
        refresh_token = create_refresh_token(
            user_id=user.id,
            institution_id=institution.id,
            user_type=user.user_type,
            status=user.status,
            extra_claims=extra_claims,
        )

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
            details={"dpop_used": bool(dpop_header)},
        )

        # 8. Pre-warm Redis Cache for Verification
        if user.status == "VERIFIED":
            cache_key = f"user_status:{user.id}"
            student_cache_data = {
                "full_name": user.full_name,
                "institution_id": str(user.institution_id),
                "institution_name": institution.name,
                "program": user.program,
                "academic_year": user.academic_year,
                "status": user.status,
            }
            try:
                await redis_client.setex(cache_key, 14400, json.dumps(student_cache_data)) # 4 hours TTL
            except Exception as e:
                logger.warning(f"Failed to pre-warm Redis cache for user {user.id}: {e}")

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
        
        try:
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                raise UnauthorizedError("User not found.")
            
            access_token = create_access_token(
                user_id=user.id,
                institution_id=user.institution_id,
                user_type=user.user_type,
                status=user.status,
            )
            new_refresh = create_refresh_token(
                user_id=user.id,
                institution_id=user.institution_id,
                user_type=user.user_type,
                status=user.status,
            )
            return {
                "access_token": access_token,
                "refresh_token": new_refresh,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            }
        except SQLAlchemyError as e:
            logging.error(f"Database unreachable during refresh: {type(e).__name__}")
            # Emergency IdP Grace Tokens
            # Max 2 tokens per outage window, hard cap total emergency extension to 30 mins
            redis_key = f"emergency_tokens:{user_id}"
            
            lua_script = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], 1800)
            end
            return current
            """
            count = await redis_client.eval(lua_script, 1, redis_key)
            
            if count > 2:
                raise UnauthorizedError("Emergency token limit reached. Please try again later.")
            
            # Issue short-lived (5 min) emergency token
            inst_id_str = payload.get("institution_id")
            user_type = payload.get("user_type")
            status = payload.get("status")
            
            if not inst_id_str or not user_type or not status:
                raise UnauthorizedError("Invalid refresh token payload for emergency fallback.")
                
            institution_id = uuid.UUID(inst_id_str)
                
            access_token = create_access_token(
                user_id=user_id,
                institution_id=institution_id,
                user_type=user_type,
                status=status,
                expires_delta=timedelta(minutes=5),
                extra_claims={"emergency": True}
            )
            
            return {
                "access_token": access_token,
                "refresh_token": refresh_token, # Keep the same refresh token
                "token_type": "bearer",
                "expires_in": 300,
            }
