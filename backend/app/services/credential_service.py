"""Credential service: issue, sign, verify, revoke, export credentials."""
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.crypto import (
    hash_payload,
    sign_payload,
    verify_signature,
)
from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.credential import Credential, CredentialVersion
from app.models.revocation import Revocation
from app.models.user import User
from app.repositories.credential_repository import CredentialRepository
from app.repositories.signing_key_repository import SigningKeyRepository
from app.schemas.credential import CredentialCreate, CredentialUpdate
from app.services.audit_service import AuditService


class CredentialService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cred_repo = CredentialRepository(db)
        self.key_repo = SigningKeyRepository(db)
        self.audit_service = AuditService(db)

    async def issue(
        self, data: CredentialCreate, institution_id: uuid.UUID, issued_by: User
    ) -> Credential:
        # 1. Get active signing key
        signing_key = await self.key_repo.get_active_key(institution_id)
        if not signing_key:
            raise ValidationError("No active signing key. Generate one first.")

        # 2. Build credential payload
        cred_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        payload = {
            "credential_id": str(cred_id),
            "student_id": str(data.student_id),
            "institution_id": str(institution_id),
            "category": data.category,
            "title": data.title,
            "metadata": data.metadata,
            "version": 1,
            "issued_at": now.isoformat(),
            "expires_at": data.expires_at.isoformat() if data.expires_at else None,
        }

        # 3. Hash and sign
        p_hash = hash_payload(payload)
        signature = await sign_payload(payload, signing_key.kms_key_id)

        # 4. Create credential
        credential = Credential(
            id=cred_id,
            institution_id=institution_id,
            student_id=data.student_id,
            category=data.category,
            title=data.title,
            description=data.description,
            metadata_=data.metadata,
            current_version=1,
            payload_hash=p_hash,
            signature=signature,
            signing_key_id=signing_key.id,
            status="ACTIVE",
            issued_at=now,
            expires_at=data.expires_at,
            issued_by=issued_by.id,
        )
        await self.cred_repo.create(credential)

        # 5. Create version 1
        version = CredentialVersion(
            id=uuid.uuid4(),
            credential_id=cred_id,
            institution_id=institution_id,
            version=1,
            payload=payload,
            payload_hash=p_hash,
            signature=signature,
            signing_key_id=signing_key.id,
            created_by=issued_by.id,
        )
        await self.cred_repo.create_version(version)

        # 6. Audit
        await self.audit_service.log(
            institution_id=institution_id,
            actor_id=issued_by.id,
            action="CREDENTIAL_ISSUED",
            target_type="credential",
            target_id=cred_id,
            details={"title": data.title, "student_id": str(data.student_id)},
        )

        return credential

    async def update_credential(
        self,
        credential_id: uuid.UUID,
        institution_id: uuid.UUID,
        data: CredentialUpdate,
        updated_by: User,
    ) -> Credential:
        credential = await self.cred_repo.get_by_id_and_institution(
            credential_id, institution_id
        )
        if not credential:
            raise NotFoundError("Credential", str(credential_id))

        signing_key = await self.key_repo.get_active_key(institution_id)
        if not signing_key:
            raise ValidationError("No active signing key.")

        # Update fields
        if data.title:
            credential.title = data.title
        if data.description is not None:
            credential.description = data.description
        if data.metadata is not None:
            credential.metadata_ = data.metadata

        new_version = credential.current_version + 1
        credential.current_version = new_version

        # Re-sign
        payload = {
            "credential_id": str(credential.id),
            "student_id": str(credential.student_id),
            "institution_id": str(institution_id),
            "category": credential.category,
            "title": credential.title,
            "metadata": credential.metadata_,
            "version": new_version,
            "issued_at": credential.issued_at.isoformat(),
            "expires_at": credential.expires_at.isoformat() if credential.expires_at else None,
        }
        p_hash = hash_payload(payload)
        signature = await sign_payload(payload, signing_key.kms_key_id)

        credential.payload_hash = p_hash
        credential.signature = signature
        credential.signing_key_id = signing_key.id

        # Create new version
        version = CredentialVersion(
            id=uuid.uuid4(),
            credential_id=credential.id,
            institution_id=institution_id,
            version=new_version,
            payload=payload,
            payload_hash=p_hash,
            signature=signature,
            signing_key_id=signing_key.id,
            change_reason=data.change_reason,
            created_by=updated_by.id,
        )
        await self.cred_repo.create_version(version)
        await self.db.flush()

        await self.audit_service.log(
            institution_id=institution_id,
            actor_id=updated_by.id,
            action="CREDENTIAL_UPDATED",
            target_type="credential",
            target_id=credential.id,
            details={"new_version": new_version},
        )

        return credential

    async def revoke(
        self,
        credential_id: uuid.UUID,
        institution_id: uuid.UUID,
        reason: str,
        revoked_by: User,
    ) -> dict:
        credential = await self.cred_repo.get_by_id_and_institution(
            credential_id, institution_id
        )
        if not credential:
            raise NotFoundError("Credential", str(credential_id))
        if credential.status == "REVOKED":
            raise ConflictError("Credential is already revoked.")

        credential.status = "REVOKED"

        revocation = Revocation(
            id=uuid.uuid4(),
            institution_id=institution_id,
            credential_id=credential_id,
            reason=reason,
            revoked_by=revoked_by.id,
            revoked_at=datetime.now(timezone.utc),
        )
        self.db.add(revocation)
        await self.db.flush()

        await self.audit_service.log(
            institution_id=institution_id,
            actor_id=revoked_by.id,
            action="CREDENTIAL_REVOKED",
            target_type="credential",
            target_id=credential_id,
            details={"reason": reason},
        )

        return {"credential_id": str(credential_id), "status": "REVOKED", "reason": reason}

    async def verify_credential(
        self, credential_id: uuid.UUID, payload_hash: str, signature_b64: str
    ) -> dict:
        credential = await self.cred_repo.get_by_id(credential_id)
        if not credential:
            return {"valid": False, "reason": "Credential not found", "signature_valid": False}

        # Check revocation
        if credential.status == "REVOKED":
            return {"valid": False, "reason": "Credential has been revoked", "signature_valid": False}

        # Check expiry
        if credential.expires_at and credential.expires_at < datetime.now(timezone.utc):
            return {"valid": False, "reason": "Credential has expired", "signature_valid": False}

        # Verify hash match
        if credential.payload_hash != payload_hash:
            return {"valid": False, "reason": "Payload hash mismatch", "signature_valid": False}

        # Verify signature
        signing_key = credential.signing_key
        if not signing_key:
            return {"valid": False, "reason": "Signing key not found", "signature_valid": False}

        # Get latest version payload for verification
        versions = await self.cred_repo.list_versions(credential_id)
        if not versions:
            return {"valid": False, "reason": "No version found", "signature_valid": False}

        latest = versions[0]
        sig_valid = await verify_signature(
            latest.payload, signature_b64, signing_key.public_key_pem
        )

        institution = credential.student.institution if credential.student else None

        return {
            "valid": sig_valid,
            "credential": {
                "title": credential.title,
                "category": credential.category,
                "issued_at": credential.issued_at.isoformat(),
                "status": credential.status,
                "revoked": credential.status == "REVOKED",
                "expired": bool(
                    credential.expires_at
                    and credential.expires_at < datetime.now(timezone.utc)
                ),
            },
            "institution": {
                "name": institution.name if institution else "Unknown",
                "verified_key": signing_key.status in ("ACTIVE", "ROTATED"),
            },
            "signature_valid": sig_valid,
        }

