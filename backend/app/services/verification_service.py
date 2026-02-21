"""Verification service: QR token generation and verification flow."""
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import NotFoundError, ValidationError
from app.core.redis import get_redis
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.reputation_repository import ReputationRepository
from app.services.audit_service import AuditService


class VerificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.reputation_repo = ReputationRepository(db)
        self.audit_service = AuditService(db)

    async def generate_qr_token(self, student: User) -> dict:
        """Generate a short-lived QR token for identity verification."""
        if student.status != "VERIFIED":
            raise ValidationError("Only verified students can generate QR tokens.")

        nonce = secrets.token_hex(32)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=settings.QR_TOKEN_EXPIRY_SECONDS)

        # Store nonce in Redis for fast, atomic consumption
        redis = await get_redis()
        await redis.setex(f"qr_nonce:{nonce}", settings.QR_TOKEN_EXPIRY_SECONDS, str(student.id))

        # Build JWT-like token (not for auth — for verification)
        payload = {
            "student_id": str(student.id),
            "institution_id": str(student.institution_id),
            "nonce": nonce,
            "iat": now.timestamp(),
            "exp": expires_at.timestamp(),
            "type": "qr_verify",
        }
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

        await self.audit_service.log(
            institution_id=student.institution_id,
            actor_id=student.id,
            action="QR_TOKEN_GENERATED",
            target_type="qr_nonce",
            target_id=student.id,
        )

        return {
            "qr_token": token,
            "expires_at": expires_at.isoformat(),
            "ttl_seconds": settings.QR_TOKEN_EXPIRY_SECONDS,
        }

    async def validate_qr_token(self, qr_token: str, verifier_ip: str | None = None) -> dict:
        """Validate a scanned QR token."""
        try:
            payload = jwt.decode(
                qr_token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except Exception:
            return {
                "valid": False,
                "reason": "Invalid or malformed QR token",
                "code": "INVALID_TOKEN",
            }

        if payload.get("type") != "qr_verify":
            return {"valid": False, "reason": "Not a QR verification token", "code": "INVALID_TYPE"}

        nonce = payload.get("nonce")
        student_id = payload.get("student_id")

        # Check expiry
        exp = payload.get("exp", 0)
        if datetime.now(timezone.utc).timestamp() > exp:
            return {"valid": False, "reason": "QR token has expired", "code": "TOKEN_EXPIRED"}

        # Check nonce (replay prevention) atomically
        redis = await get_redis()
        stored_student_id = await redis.getdel(f"qr_nonce:{nonce}")
        if not stored_student_id or stored_student_id.decode("utf-8") != student_id:
            return {"valid": False, "reason": "Invalid or already used QR token", "code": "INVALID_NONCE"}

        # Lookup student
        student = await self.user_repo.get_by_id(uuid.UUID(student_id))
        if not student:
            return {"valid": False, "reason": "Student not found", "code": "STUDENT_NOT_FOUND"}
        if student.status != "VERIFIED":
            return {"valid": False, "reason": "Student is not verified", "code": "NOT_VERIFIED"}

        rep = await self.reputation_repo.get_by_user(student.id, student.institution_id)
        institution = student.institution

        await self.audit_service.log(
            institution_id=student.institution_id,
            actor_id=None,
            action="QR_VERIFIED",
            target_type="user",
            target_id=student.id,
            details={"verifier_ip": verifier_ip},
        )

        return {
            "valid": True,
            "student": {
                "full_name": student.full_name,
                "institution": institution.name if institution else "Unknown",
                "program": student.program,
                "academic_year": student.academic_year,
                "status": student.status,
                "reputation_score": float(rep.total_score) if rep else 0,
            },
            "verification_timestamp": datetime.now(timezone.utc).isoformat(),
            "signature_valid": True,
        }
