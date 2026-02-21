from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.v1.router import api_v1_router
from app.config import settings
from app.core.error_handlers import register_error_handlers
from app.db.session import engine
from app.middleware.logging_middleware import LoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown hooks."""
    # Startup — could initialize Redis pool, warm caches, etc.
    yield
    # Shutdown — dispose DB engine
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title="EduLink API",
        version="1.0.0",
        description="Enterprise Digital Identity Infrastructure SaaS",
        docs_url="/api/v1/docs",
        redoc_url="/api/v1/redoc",
        lifespan=lifespan,
    )

    # ── Middleware ──────────────────────────────────────────
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Prometheus Metrics ─────────────────────────────────
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")

    # ── Routers ────────────────────────────────────────────
    app.include_router(api_v1_router, prefix="/api/v1")

    # ── Error Handlers ─────────────────────────────────────
    register_error_handlers(app)

    return app


app = create_app()
