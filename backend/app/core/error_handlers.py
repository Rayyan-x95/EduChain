"""Global exception handlers for the FastAPI app."""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.exceptions import EduLinkError


def register_error_handlers(app: FastAPI):
    @app.exception_handler(EduLinkError)
    async def edulink_error_handler(request: Request, exc: EduLinkError):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "message": exc.message,
                "code": exc.code,
                "details": exc.details,
            },
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "An unexpected error occurred",
                "code": "INTERNAL_ERROR",
                "details": {},
            },
        )
