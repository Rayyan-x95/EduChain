"""Key management service: generate, rotate, list signing keys."""
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.crypto import (
    compute_fingerprint,
    generate_keypair,
)
from app.core.exceptions import NotFoundError, ConflictError
from app.models.signing_key import SigningKey
from app.models.user import User
from app.repositories.signing_key_repository import SigningKeyRepository
from app.services.audit_service import AuditService


class KeyManagementService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.key_repo = SigningKeyRepository(db)
        self.audit_service = AuditService(db)

    async def generate_key(self, institution_id: uuid.UUID, creator: User) -> SigningKey:
        """Generate a new ECDSA keypair for the institution via KMS. Rotates existing active key."""
        # Rotate any existing active key
        existing = await self.key_repo.get_active_key(institution_id)
        if existing:
            existing.status = "ROTATED"
            existing.rotated_at = datetime.now(timezone.utc)
            existing.rotated_by = creator.id

        # Generate new keypair via KMS
        kms_key_id, public_pem = await generate_keypair()
        fingerprint = compute_fingerprint(public_pem)

        key = SigningKey(
            id=uuid.uuid4(),
            institution_id=institution_id,
            key_alias=f"key-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
            algorithm="ECDSA_P256",
            public_key_pem=public_pem,
            kms_key_id=kms_key_id,
            key_fingerprint=fingerprint,
            status="ACTIVE",
            created_by=creator.id,
        )
        await self.key_repo.create(key)

        await self.audit_service.log(
            institution_id=institution_id,
            actor_id=creator.id,
            action="KEY_GENERATED",
            target_type="signing_key",
            target_id=key.id,
            details={"fingerprint": fingerprint, "rotated_previous": existing is not None},
        )

        return key

    async def rotate_key(self, institution_id: uuid.UUID, actor: User) -> SigningKey:
        """Explicitly rotate the current active key and generate a new one."""
        return await self.generate_key(institution_id, actor)

    async def list_keys(self, institution_id: uuid.UUID) -> list[SigningKey]:
        return await self.key_repo.list_by_institution(institution_id)

