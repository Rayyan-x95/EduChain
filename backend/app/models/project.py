"""Project model."""
import uuid

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Project(BaseModel):
    __tablename__ = "projects"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    url: Mapped[str | None] = mapped_column(Text)

    github_repo_url: Mapped[str | None] = mapped_column(Text)
    github_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    skills: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
