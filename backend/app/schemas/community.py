"""Community schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReputationResponse(BaseModel):
    user_id: UUID
    verification_score: float
    credential_score: float
    endorsement_score: float
    community_score: float
    github_score: float
    institution_modifier: float
    total_score: float
    last_computed_at: datetime

    model_config = {"from_attributes": True}


class BadgeResponse(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    icon_url: str | None = None
    criteria: dict = {}
    created_at: datetime

    model_config = {"from_attributes": True}


class UserBadgeResponse(BaseModel):
    badge_id: UUID
    badge_name: str
    badge_description: str | None = None
    icon_url: str | None = None
    awarded_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    user_id: UUID
    full_name: str
    program: str | None = None
    total_score: float
    rank: int
