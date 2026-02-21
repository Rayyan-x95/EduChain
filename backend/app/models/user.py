"""User model."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String, Text, DateTime
from sqlalchemy.dialects.postgresql import INET, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False
    )

    # Identity
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Student-specific
    enrollment_number: Mapped[str | None] = mapped_column(String(100))
    program: Mapped[str | None] = mapped_column(String(255))
    academic_year: Mapped[str | None] = mapped_column(String(50))
    department: Mapped[str | None] = mapped_column(String(255))

    # Type & Status
    user_type: Mapped[str] = mapped_column(String(50), default="STUDENT", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)

    # Verification
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    verified_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text)

    # Profile
    avatar_url: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(20))

    # Metadata
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_login_ip: Mapped[str | None] = mapped_column(String(45))

    # Relationships
    institution = relationship("Institution", back_populates="users", lazy="selectin")
    roles = relationship("Role", back_populates="user", lazy="selectin", foreign_keys="Role.user_id")
    credentials = relationship("Credential", back_populates="student", lazy="selectin", foreign_keys="Credential.student_id")
