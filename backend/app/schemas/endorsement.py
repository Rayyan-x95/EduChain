"""Endorsement schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class EndorsementCreate(BaseModel):
    receiver_id: UUID
    message: str | None = None
    skills: list[str] = []


class EndorsementGiver(BaseModel):
    id: UUID
    full_name: str

    model_config = {"from_attributes": True}


class EndorsementReceiver(BaseModel):
    id: UUID
    full_name: str

    model_config = {"from_attributes": True}


class EndorsementResponse(BaseModel):
    id: UUID
    giver_id: UUID
    receiver_id: UUID
    giver_name: str | None = None
    receiver_name: str | None = None
    message: str | None = None
    skills: list[str] = []
    created_at: datetime

    model_config = {"from_attributes": True}
