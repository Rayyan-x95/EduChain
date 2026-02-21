"""GitHub integration schemas."""
from datetime import datetime
from pydantic import BaseModel


class GitHubOAuthCallback(BaseModel):
    code: str
    state: str | None = None


class ContributionSummary(BaseModel):
    github_username: str
    connected_at: datetime | None = None
    ownership_verified: bool = False
    summary: dict = {}
