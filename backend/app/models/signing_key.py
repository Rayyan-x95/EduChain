"""Signing Key model."""
import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class SigningKey(BaseModel):
    __tablename__ = "signing_keys"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False
    )

    key_alias: Mapped[str] = mapped_column(String(100), nullable=False)
    algorithm: Mapped[str] = mapped_column(String(50), default="ECDSA_P256", nullable=False)

    # Key material
    public_key_pem: Mapped[str] = mapped_column(Text, nullable=False)
    kms_key_id: Mapped[str] = mapped_column(String(255), nullable=False) # Replaced private_key_enc with KMS reference
    key_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)

    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)

    # Lifecycle
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    rotated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    rotated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )

    # Relationships
    institution = relationship("Institution", back_populates="signing_keys", lazy="selectin")
