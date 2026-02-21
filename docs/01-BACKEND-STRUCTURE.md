# Backend Folder Structure — EduLink (FastAPI)

```
backend/
├── alembic/                          # Database migrations
│   ├── versions/                     # Migration files
│   ├── env.py
│   ├── script.py.mako
│   └── alembic.ini
│
├── app/
│   ├── __init__.py
│   ├── main.py                       # FastAPI app factory + lifespan
│   ├── config.py                     # Pydantic Settings (env-based)
│   │
│   ├── api/                          # API Layer (Routers)
│   │   ├── __init__.py
│   │   ├── deps.py                   # Shared dependencies (get_db, get_current_user)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py             # Aggregates all v1 routers
│   │       ├── auth.py               # POST /auth/register, /auth/login, etc.
│   │       ├── students.py           # Student profile, ID card, privacy
│   │       ├── credentials.py        # Issue, list, export, share credentials
│   │       ├── appeals.py            # Submit, review appeals
│   │       ├── endorsements.py       # Give/receive endorsements
│   │       ├── verification.py       # QR generate, QR verify, credential verify
│   │       ├── institutions.py       # Institution management, public keys
│   │       ├── recruiters.py         # Recruiter search, profiles, bulk verify
│   │       ├── admin.py              # Key management, role mgmt, audit logs
│   │       ├── community.py          # Badges, collaborations, reputation
│   │       ├── github_integration.py # OAuth, contribution summary
│   │       └── health.py             # Health check, readiness
│   │
│   ├── core/                         # Cross-cutting concerns
│   │   ├── __init__.py
│   │   ├── security.py               # JWT creation/validation, password hashing
│   │   ├── crypto.py                 # ECDSA signing, verification, key generation
│   │   ├── permissions.py            # Role-based access control decorators
│   │   ├── exceptions.py             # Custom exception classes
│   │   ├── error_handlers.py         # Global exception handlers
│   │   ├── rate_limiter.py           # Redis-backed rate limiting
│   │   ├── logging_config.py         # Structured JSON logging
│   │   └── constants.py              # Enums, status codes, config constants
│   │
│   ├── models/                       # SQLAlchemy ORM Models
│   │   ├── __init__.py
│   │   ├── base.py                   # Base model with id, timestamps, institution_id
│   │   ├── institution.py            # Institution model
│   │   ├── user.py                   # User model (students, admins, recruiters)
│   │   ├── role.py                   # Role model (institution-scoped)
│   │   ├── credential.py             # Credential + CredentialVersion models
│   │   ├── appeal.py                 # Appeal model
│   │   ├── revocation.py             # Revocation registry model
│   │   ├── endorsement.py            # Endorsement model
│   │   ├── project.py                # Project model
│   │   ├── audit_log.py              # Audit log model
│   │   ├── blacklist.py              # Blacklist model
│   │   ├── reputation.py             # Reputation score model
│   │   ├── signing_key.py            # Signing key model (public + encrypted private)
│   │   └── qr_nonce.py               # QR nonce tracking (replay prevention)
│   │
│   ├── schemas/                      # Pydantic v2 Schemas (Request/Response DTOs)
│   │   ├── __init__.py
│   │   ├── auth.py                   # LoginRequest, RegisterRequest, TokenResponse
│   │   ├── student.py                # StudentProfile, IDCard, PrivacySettings
│   │   ├── credential.py             # CredentialCreate, CredentialResponse, etc.
│   │   ├── appeal.py                 # AppealSubmit, AppealReview, AppealResponse
│   │   ├── endorsement.py            # EndorsementCreate, EndorsementResponse
│   │   ├── verification.py           # QRTokenRequest, QRVerifyResponse
│   │   ├── institution.py            # InstitutionCreate, InstitutionResponse
│   │   ├── recruiter.py              # RecruiterSearch, ProfileResponse
│   │   ├── admin.py                  # RoleAssign, KeyRotate, AuditLogResponse
│   │   ├── community.py              # BadgeResponse, ReputationResponse
│   │   ├── github.py                 # GitHubOAuthCallback, ContributionSummary
│   │   └── common.py                 # Pagination, ErrorResponse, SuccessResponse
│   │
│   ├── services/                     # Business Logic Layer
│   │   ├── __init__.py
│   │   ├── auth_service.py           # Registration, login, email verification
│   │   ├── student_service.py        # Profile management, ID card generation
│   │   ├── credential_service.py     # Issue, sign, export, version credentials
│   │   ├── appeal_service.py         # Submit appeal, review, enforce rules
│   │   ├── endorsement_service.py    # Rate-limited endorsement logic
│   │   ├── verification_service.py   # QR token generation, verification flow
│   │   ├── institution_service.py    # Institution CRUD, settings
│   │   ├── recruiter_service.py      # Search, profile access, bulk verify
│   │   ├── key_management_service.py # Generate, rotate, publish keys
│   │   ├── reputation_service.py     # Compute reputation scores
│   │   ├── community_service.py      # Badges, collaboration tracking
│   │   ├── github_service.py         # OAuth flow, fetch contribution data
│   │   ├── audit_service.py          # Log actions, query audit trail
│   │   ├── email_service.py          # Send verification, notification emails
│   │   └── storage_service.py        # S3-compatible file upload/download
│   │
│   ├── repositories/                 # Data Access Layer
│   │   ├── __init__.py
│   │   ├── base_repository.py        # Generic CRUD with institution scoping
│   │   ├── user_repository.py
│   │   ├── credential_repository.py
│   │   ├── appeal_repository.py
│   │   ├── endorsement_repository.py
│   │   ├── institution_repository.py
│   │   ├── signing_key_repository.py
│   │   ├── audit_log_repository.py
│   │   ├── reputation_repository.py
│   │   └── qr_nonce_repository.py
│   │
│   ├── db/                           # Database Configuration
│   │   ├── __init__.py
│   │   ├── session.py                # Async SQLAlchemy engine + session factory
│   │   ├── base.py                   # Import all models (for Alembic)
│   │   └── init_db.py                # Initial data seeding
│   │
│   ├── middleware/                    # Custom Middleware
│   │   ├── __init__.py
│   │   ├── cors.py                   # CORS configuration
│   │   ├── logging_middleware.py     # Request/response logging
│   │   ├── tenant_middleware.py      # Institution context injection
│   │   └── ip_logging.py            # Client IP capture
│   │
│   └── tasks/                        # Background Tasks (ARQ)
│       ├── __init__.py
│       ├── worker.py                 # ARQ worker configuration
│       ├── email_tasks.py            # Async email sending
│       ├── reputation_tasks.py       # Periodic reputation recalculation
│       └── cleanup_tasks.py          # Expired nonce/token cleanup
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                   # Fixtures: test DB, client, auth tokens
│   ├── factories/                    # Factory Boy factories for test data
│   │   ├── __init__.py
│   │   ├── user_factory.py
│   │   ├── credential_factory.py
│   │   └── institution_factory.py
│   ├── unit/
│   │   ├── test_crypto.py
│   │   ├── test_reputation.py
│   │   ├── test_auth_service.py
│   │   └── test_credential_service.py
│   ├── integration/
│   │   ├── test_auth_api.py
│   │   ├── test_student_api.py
│   │   ├── test_credential_api.py
│   │   ├── test_verification_api.py
│   │   └── test_recruiter_api.py
│   └── e2e/
│       └── test_full_flow.py
│
├── scripts/
│   ├── create_superadmin.py          # One-time admin setup
│   ├── generate_keypair.py           # CLI key generation
│   └── seed_demo_data.py             # Demo data for development
│
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .env.test
├── pyproject.toml                    # Project config (ruff, mypy, pytest)
├── requirements.txt
├── requirements-dev.txt
└── README.md
```

## Key Files Explained

### `app/main.py` — Application Factory

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.config import settings
from app.core.error_handlers import register_error_handlers
from app.db.session import engine
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.ip_logging import IPLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize DB pool, Redis, etc.
    yield
    # Shutdown: close connections
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title="EduLink API",
        version="1.0.0",
        description="Community-Driven Institutional Student Verification Platform",
        docs_url="/api/v1/docs",
        redoc_url="/api/v1/redoc",
        lifespan=lifespan,
    )

    # Middleware (order matters — last added = first executed)
    app.add_middleware(IPLoggingMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(api_v1_router, prefix="/api/v1")

    # Error handlers
    register_error_handlers(app)

    return app


app = create_app()
```

### `app/config.py` — Environment Configuration

```python
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EduLink"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"  # development | staging | production

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # S3
    S3_ENDPOINT: str
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET: str = "edulink"

    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # QR
    QR_TOKEN_EXPIRY_MINUTES: int = 10

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
```

### `app/core/crypto.py` — ECDSA Operations

```python
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend
import json
import hashlib


def generate_keypair() -> tuple[bytes, bytes]:
    """Generate ECDSA P-256 keypair. Returns (private_pem, public_pem)."""
    private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    return private_pem, public_pem


def sign_payload(payload: dict, private_key_pem: bytes) -> bytes:
    """Sign a canonical JSON payload with ECDSA P-256 + SHA-256."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(canonical.encode()).digest()

    private_key = serialization.load_pem_private_key(
        private_key_pem, password=None, backend=default_backend()
    )

    signature = private_key.sign(digest, ec.ECDSA(hashes.SHA256()))
    return signature


def verify_signature(payload: dict, signature: bytes, public_key_pem: bytes) -> bool:
    """Verify an ECDSA signature against a canonical JSON payload."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(canonical.encode()).digest()

    public_key = serialization.load_pem_public_key(
        public_key_pem, backend=default_backend()
    )

    try:
        public_key.verify(signature, digest, ec.ECDSA(hashes.SHA256()))
        return True
    except Exception:
        return False
```

### `app/api/deps.py` — Shared Dependencies

```python
from typing import AsyncGenerator, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import async_session_factory
from app.models.user import User
from app.repositories.user_repository import UserRepository

security = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    token_data = decode_access_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(token_data.user_id)

    if not user or user.status in ("SUSPENDED", "BLACKLISTED"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active",
        )

    return user


def require_roles(*roles: str):
    """Dependency factory for role-based access control."""
    async def role_checker(user: Annotated[User, Depends(get_current_user)]):
        if user.role.name not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of: {', '.join(roles)}",
            )
        return user
    return role_checker


# Convenience type aliases
CurrentUser = Annotated[User, Depends(get_current_user)]
DBSession = Annotated[AsyncSession, Depends(get_db)]
```
