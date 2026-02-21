"""Reputation Score model."""
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Text, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ReputationScore(BaseModel):
    __tablename__ = "reputation_scores"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )

    # Component scores (0-100)
    verification_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    credential_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    endorsement_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    community_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    github_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)

    # Institution modifier (-20 to +20)
    institution_modifier: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    modified_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    modifier_reason: Mapped[str | None] = mapped_column(Text)

    # Computed total
    total_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)

    last_computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Relationships
    user = relationship("User", back_populates="reputation", foreign_keys=[user_id], lazy="selectin")
