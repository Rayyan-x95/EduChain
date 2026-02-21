"""Verification service: QR token generation and verification flow."""
import json
import secrets
import string
import uuid
from datetime import datetime, timedelta, timezone

from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import NotFoundError, ValidationError
from app.core.redis import get_redis
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService


class VerificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_service = AuditService(db)

    async def generate_qr_token(self, student: User) -> dict:
        """Generate a short-lived QR token for identity verification."""
        if student.status != "VERIFIED":
            raise ValidationError("Only verified students can generate QR tokens.")

        nonce = secrets.token_hex(32)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=settings.QR_TOKEN_EXPIRY_SECONDS)

        redis = await get_redis()
        
        # Generate unique short-code
        short_code = None
        alphabet = string.ascii_uppercase + string.digits
        for _ in range(5):
            candidate = "".join(secrets.choice(alphabet) for _ in range(6))
            # Store short-code in Redis with NX
            shortcode_data = json.dumps({"student_id": str(student.id), "nonce": nonce})
            success = await redis.set(
                f"qr_shortcode:{candidate}", 
                shortcode_data, 
                ex=settings.QR_TOKEN_EXPIRY_SECONDS, 
                nx=True
            )
            if success:
                short_code = candidate
                break
                
        if not short_code:
            raise ValidationError("Failed to generate a unique short-code. Please try again.")

        # Store nonce in Redis for fast, atomic consumption
        nonce_data = json.dumps({"student_id": str(student.id), "short_code": short_code})
        try:
            await redis.setex(f"qr_nonce:{nonce}", settings.QR_TOKEN_EXPIRY_SECONDS, nonce_data)
        except Exception as e:
            await redis.delete(f"qr_shortcode:{short_code}")
            raise e

        # Build JWT-like token (not for auth — for verification)
        payload = {
            "student_id": str(student.id),
            "institution_id": str(student.institution_id),
            "nonce": nonce,
            "short_code": short_code,
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
            "short_code": short_code,
            "expires_at": expires_at.isoformat(),
            "ttl_seconds": settings.QR_TOKEN_EXPIRY_SECONDS,
        }

    async def validate_qr_token(self, qr_token: str, verifier_ip: str | None = None) -> dict:
        """Validate a scanned QR token or a manual short-code."""
        redis = await get_redis()
        
        # Check if it's a short-code (6 chars)
        normalized_token = qr_token.strip().upper()
        if len(normalized_token) == 6 and normalized_token.isalnum():
            stored_data = await redis.getdel(f"qr_shortcode:{normalized_token}")
            if not stored_data:
                return {"valid": False, "reason": "Invalid or expired short-code", "code": "INVALID_SHORTCODE"}
            
            try:
                data = json.loads(stored_data.decode("utf-8"))
                student_id = data["student_id"]
                nonce = data.get("nonce")
                if nonce:
                    await redis.delete(f"qr_nonce:{nonce}")
            except (json.JSONDecodeError, KeyError):
                return {"valid": False, "reason": "Invalid short-code data", "code": "INVALID_SHORTCODE_DATA"}
        else:
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
            stored_data = await redis.getdel(f"qr_nonce:{nonce}")
            if not stored_data:
                return {"valid": False, "reason": "Invalid or already used QR token", "code": "INVALID_NONCE"}
                
            try:
                data = json.loads(stored_data.decode("utf-8"))
                if data["student_id"] != student_id:
                    return {"valid": False, "reason": "Invalid or already used QR token", "code": "INVALID_NONCE"}
                short_code = data.get("short_code")
                if short_code:
                    await redis.delete(f"qr_shortcode:{short_code}")
            except (json.JSONDecodeError, KeyError):
                return {"valid": False, "reason": "Invalid nonce data", "code": "INVALID_NONCE_DATA"}

        # Lookup student from Redis cache first
        cache_key = f"user_status:{student_id}"
        cached_student = await redis.get(cache_key)
        
        if cached_student:
            try:
                student_data = json.loads(cached_student.decode("utf-8"))
                if student_data.get("status") != "VERIFIED":
                    return {"valid": False, "reason": "Student is not verified", "code": "NOT_VERIFIED"}
                
                await self.audit_service.log(
                    institution_id=uuid.UUID(student_data["institution_id"]),
                    actor_id=None,
                    action="QR_VERIFIED",
                    target_type="user",
                    target_id=uuid.UUID(student_id),
                    details={"verifier_ip": verifier_ip, "cache_hit": True},
                )
                
                return {
                    "valid": True,
                    "student": {
                        "full_name": student_data.get("full_name"),
                        "institution": student_data.get("institution_name", "Unknown"),
                        "program": student_data.get("program"),
                        "academic_year": student_data.get("academic_year"),
                        "status": student_data.get("status"),
                    },
                    "verification_timestamp": datetime.now(timezone.utc).isoformat(),
                    "signature_valid": True,
                }
            except (json.JSONDecodeError, KeyError):
                pass # Fallback to DB if cache is corrupted

        # Fallback to DB
        student = await self.user_repo.get_by_id(uuid.UUID(student_id))
        if not student:
            return {"valid": False, "reason": "Student not found", "code": "STUDENT_NOT_FOUND"}
        if student.status != "VERIFIED":
            return {"valid": False, "reason": "Student is not verified", "code": "NOT_VERIFIED"}

        institution = student.institution
        
        # Populate cache
        student_cache_data = {
            "full_name": student.full_name,
            "institution_id": str(student.institution_id),
            "institution_name": institution.name if institution else "Unknown",
            "program": student.program,
            "academic_year": student.academic_year,
            "status": student.status,
        }
        await redis.setex(cache_key, 14400, json.dumps(student_cache_data)) # 4 hours TTL

        await self.audit_service.log(
            institution_id=student.institution_id,
            actor_id=None,
            action="QR_VERIFIED",
            target_type="user",
            target_id=student.id,
            details={"verifier_ip": verifier_ip, "cache_hit": False},
        )

        return {
            "valid": True,
            "student": {
                "full_name": student.full_name,
                "institution": institution.name if institution else "Unknown",
                "program": student.program,
                "academic_year": student.academic_year,
                "status": student.status,
            },
            "verification_timestamp": datetime.now(timezone.utc).isoformat(),
            "signature_valid": True,
        }

    async def validate_wallet_qr(self, credential_id: str, verifier_id: str, verifier_ip: str | None = None) -> dict:
        """Validate a static wallet QR code with velocity checks."""
        try:
            credential_uuid = uuid.UUID(credential_id)
        except ValueError:
            return {"valid": False, "reason": "Invalid credential ID format", "code": "INVALID_FORMAT"}

        redis = await get_redis()
        
        # Velocity check: Prevent rapid reuse at different verifiers
        velocity_key = f"wallet_scan:{credential_id}"
        last_scan = await redis.get(velocity_key)
        
        if last_scan:
            try:
                scan_data = json.loads(last_scan.decode("utf-8"))
                if scan_data.get("verifier_id") != verifier_id:
                    # Flag for suspicious activity
                    await self.audit_service.log(
                        institution_id=uuid.UUID(int=0), # Sentinel for system-level events
                        actor_id=None,
                        action="WALLET_REPLAY_ATTEMPT",
                        target_type="credential",
                        target_id=credential_uuid,
                        details={"verifier_ip": verifier_ip, "verifier_id": verifier_id, "previous_verifier": scan_data.get("verifier_id")},
                    )
                    return {"valid": False, "reason": "Credential scanned recently at another location", "code": "VELOCITY_EXCEEDED"}
            except (json.JSONDecodeError, KeyError):
                pass
                
        # Record scan
        scan_record = json.dumps({"verifier_id": verifier_id, "timestamp": datetime.now(timezone.utc).isoformat()})
        await redis.setex(velocity_key, settings.WALLET_VELOCITY_WINDOW_SECONDS, scan_record) # 60 second velocity window
        
        # Proceed with normal student lookup (using cache first)
        # In a real implementation, we'd need to map credential_id to student_id
        # For this mock, we'll assume credential_id == student_id for simplicity of the example
        student_id = credential_id
        
        # Lookup student from Redis cache first
        cache_key = f"user_status:{student_id}"
        cached_student = await redis.get(cache_key)
        
        if cached_student:
            try:
                student_data = json.loads(cached_student.decode("utf-8"))
                if student_data.get("status") != "VERIFIED":
                    return {"valid": False, "reason": "Student is not verified", "code": "NOT_VERIFIED"}
                
                await self.audit_service.log(
                    institution_id=uuid.UUID(student_data["institution_id"]),
                    actor_id=None,
                    action="QR_VERIFIED",
                    target_type="user",
                    target_id=uuid.UUID(student_id),
                    details={"verifier_ip": verifier_ip, "cache_hit": True, "wallet_scan": True},
                )
                
                return {
                    "valid": True,
                    "student": {
                        "full_name": student_data.get("full_name"),
                        "institution": student_data.get("institution_name", "Unknown"),
                        "program": student_data.get("program"),
                        "academic_year": student_data.get("academic_year"),
                        "status": student_data.get("status"),
                    },
                    "verification_timestamp": datetime.now(timezone.utc).isoformat(),
                    "signature_valid": True,
                }
            except (json.JSONDecodeError, KeyError):
                pass # Fallback to DB if cache is corrupted

        # Fallback to DB
        student = await self.user_repo.get_by_id(uuid.UUID(student_id))
        if not student:
            return {"valid": False, "reason": "Student not found", "code": "STUDENT_NOT_FOUND"}
        if student.status != "VERIFIED":
            return {"valid": False, "reason": "Student is not verified", "code": "NOT_VERIFIED"}

        institution = student.institution
        
        # Populate cache
        student_cache_data = {
            "full_name": student.full_name,
            "institution_id": str(student.institution_id),
            "institution_name": institution.name if institution else "Unknown",
            "program": student.program,
            "academic_year": student.academic_year,
            "status": student.status,
        }
        await redis.setex(cache_key, 14400, json.dumps(student_cache_data)) # 4 hours TTL

        await self.audit_service.log(
            institution_id=student.institution_id,
            actor_id=None,
            action="QR_VERIFIED",
            target_type="user",
            target_id=student.id,
            details={"verifier_ip": verifier_ip, "cache_hit": False, "wallet_scan": True},
        )

        return {
            "valid": True,
            "student": {
                "full_name": student.full_name,
                "institution": institution.name if institution else "Unknown",
                "program": student.program,
                "academic_year": student.academic_year,
                "status": student.status,
            },
            "verification_timestamp": datetime.now(timezone.utc).isoformat(),
            "signature_valid": True,
        }
