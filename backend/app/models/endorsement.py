"""Endorsement model."""
import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Text, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

import uuid as _uuid
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


class Endorsement(Base):
    __tablename__ = "endorsements"
    __table_args__ = (
        CheckConstraint("giver_id != receiver_id", name="no_self_endorsement"),
    )

    id: Mapped[_uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=_uuid.uuid4
    )
    institution_id: Mapped[_uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False
    )

    giver_id: Mapped[_uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    receiver_id: Mapped[_uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    message: Mapped[str | None] = mapped_column(Text)
    skills: Mapped[list[str] | None] = mapped_column(ARRAY(String))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(__import__("datetime").timezone.utc),
        nullable=False,
    )
