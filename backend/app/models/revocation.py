"""Revocation model."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Revocation(BaseModel):
    __tablename__ = "revocations"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False
    )
    credential_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("credentials.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    reason: Mapped[str] = mapped_column(Text, nullable=False)
    revoked_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
