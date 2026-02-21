"""GitHub integration routes."""
from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from app.api.deps import CurrentUser, DBSession
from app.schemas.github import ContributionSummary, GitHubOAuthCallback
from app.schemas.common import SuccessResponse
from app.services.github_service import GitHubService

router = APIRouter(prefix="/github", tags=["GitHub"])


@router.get("/oauth/authorize")
async def authorize(user: CurrentUser, db: DBSession):
    svc = GitHubService(db)
    url = svc.get_oauth_url(state=str(user.id))
    return {"authorization_url": url}


@router.post("/oauth/callback")
async def callback(body: GitHubOAuthCallback, user: CurrentUser, db: DBSession):
    svc = GitHubService(db)
    result = await svc.handle_callback(body.code, user)
    return result


@router.get("/contributions", response_model=ContributionSummary)
async def contributions(user: CurrentUser, db: DBSession):
    svc = GitHubService(db)
    data = await svc.get_contributions(user)
    return ContributionSummary(**data)


@router.post("/disconnect", response_model=SuccessResponse)
async def disconnect(user: CurrentUser, db: DBSession):
    svc = GitHubService(db)
    await svc.disconnect(user)
    return SuccessResponse(message="GitHub account disconnected.")
