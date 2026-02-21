"""Appeal schemas."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AppealSubmit(BaseModel):
    reason: str
    supporting_document: str | None = None  # base64 or URL


class AppealReview(BaseModel):
    status: str  # APPROVED or REJECTED
    review_notes: str | None = None


class AppealResponse(BaseModel):
    id: UUID
    student_id: UUID
    reason: str
    supporting_doc_url: str | None = None
    status: str
    submitted_at: datetime
    appeal_deadline: datetime
    reviewed_by: UUID | None = None
    reviewed_at: datetime | None = None
    review_notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
