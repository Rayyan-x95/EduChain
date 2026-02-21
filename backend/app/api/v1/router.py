"""API v1 router: aggregates all sub-routers."""
from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.credentials import router as credentials_router
from app.api.v1.institutions import router as institutions_router
from app.api.v1.students import router as students_router
from app.api.v1.verification import router as verification_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(students_router)
api_v1_router.include_router(credentials_router)
api_v1_router.include_router(verification_router)
api_v1_router.include_router(institutions_router)
api_v1_router.include_router(admin_router)
