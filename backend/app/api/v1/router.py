"""API v1 router: aggregates all sub-routers."""
from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.appeals import router as appeals_router
from app.api.v1.auth import router as auth_router
from app.api.v1.community import router as community_router
from app.api.v1.credentials import router as credentials_router
from app.api.v1.endorsements import router as endorsements_router
from app.api.v1.github import router as github_router
from app.api.v1.institutions import router as institutions_router
from app.api.v1.recruiter import router as recruiter_router
from app.api.v1.students import router as students_router
from app.api.v1.verification import router as verification_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(students_router)
api_v1_router.include_router(credentials_router)
api_v1_router.include_router(appeals_router)
api_v1_router.include_router(endorsements_router)
api_v1_router.include_router(verification_router)
api_v1_router.include_router(institutions_router)
api_v1_router.include_router(recruiter_router)
api_v1_router.include_router(github_router)
api_v1_router.include_router(community_router)
api_v1_router.include_router(admin_router)
