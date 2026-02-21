"""Institution model."""
import uuid
from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Institution(BaseModel):
    __tablename__ = "institutions"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    domain: Mapped[str | None] = mapped_column(String(255))
    logo_url: Mapped[str | None] = mapped_column(Text)
    website: Mapped[str | None] = mapped_column(Text)
    address: Mapped[str | None] = mapped_column(Text)
    country: Mapped[str | None] = mapped_column(String(100))

    # Subscription
    tier: Mapped[str] = mapped_column(String(50), default="free", nullable=False)
    max_students: Mapped[int] = mapped_column(Integer, default=50, nullable=False)

    # Settings
    settings: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    users = relationship("User", back_populates="institution", lazy="selectin")
    signing_keys = relationship("SigningKey", back_populates="institution", lazy="selectin")
