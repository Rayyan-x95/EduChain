"""Appeal model."""
import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Appeal(BaseModel):
    __tablename__ = "appeals"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    reason: Mapped[str] = mapped_column(Text, nullable=False)
    supporting_doc_url: Mapped[str | None] = mapped_column(Text)

    status: Mapped[str] = mapped_column(String(20), default="SUBMITTED", nullable=False)

    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    appeal_deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    review_notes: Mapped[str | None] = mapped_column(Text)
