"""GitHub integration service: OAuth flow, contribution summary."""
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import ValidationError
from app.models.user import User


class GitHubService:
    OAUTH_URL = "https://github.com/login/oauth/authorize"
    TOKEN_URL = "https://github.com/login/oauth/access_token"
    API_URL = "https://api.github.com"

    def __init__(self, db: AsyncSession):
        self.db = db

    def get_oauth_url(self, state: str | None = None) -> str:
        params = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "redirect_uri": settings.GITHUB_REDIRECT_URI,
            "scope": "read:user repo",
        }
        if state:
            params["state"] = state
        qs = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.OAUTH_URL}?{qs}"

    async def handle_callback(self, code: str, user: User) -> dict:
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                self.TOKEN_URL,
                json={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                },
                headers={"Accept": "application/json"},
            )
            data = resp.json()

        access_token = data.get("access_token")
        if not access_token:
            raise ValidationError("Failed to exchange GitHub OAuth code.")

        # Get GitHub user info
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.API_URL}/user",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            github_user = resp.json()

        user.github_username = github_user.get("login")
        user.github_oauth_token = access_token  # Should be encrypted in production
        user.github_connected_at = datetime.now(timezone.utc)
        await self.db.flush()

        return {
            "github_username": user.github_username,
            "connected_at": user.github_connected_at.isoformat(),
        }

    async def get_contributions(self, user: User) -> dict:
        if not user.github_oauth_token or not user.github_username:
            raise ValidationError("GitHub account not connected.")

        headers = {"Authorization": f"Bearer {user.github_oauth_token}"}

        async with httpx.AsyncClient() as client:
            # Get user info
            user_resp = await client.get(f"{self.API_URL}/user", headers=headers)
            user_data = user_resp.json()

            # Get repos
            repos_resp = await client.get(
                f"{self.API_URL}/user/repos?per_page=100&sort=updated",
                headers=headers,
            )
            repos = repos_resp.json()

        # Compute summary
        languages = set()
        for repo in repos if isinstance(repos, list) else []:
            if repo.get("language"):
                languages.add(repo["language"])

        return {
            "github_username": user.github_username,
            "connected_at": user.github_connected_at.isoformat() if user.github_connected_at else None,
            "ownership_verified": True,
            "summary": {
                "public_repos": user_data.get("public_repos", 0),
                "total_commits_last_year": 0,  # Requires GraphQL API
                "total_prs": 0,
                "total_issues": 0,
                "top_languages": list(languages)[:5],
                "contribution_streak_days": 0,
            },
        }

    async def disconnect(self, user: User) -> None:
        user.github_username = None
        user.github_oauth_token = None
        user.github_connected_at = None
        await self.db.flush()
