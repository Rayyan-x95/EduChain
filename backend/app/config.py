from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EduLink"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Database (Supabase)
    # Format: postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    DATABASE_URL: str = "postgresql+asyncpg://postgres.sutjmlvobmceqobgkvym:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "ES256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        if info.data.get("ENVIRONMENT") == "production" and v == "change-me-in-production":
            raise ValueError("JWT_SECRET_KEY must be changed in production")
        return v

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # S3
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "edulink"

    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@edulink.dev"
    FRONTEND_URL: str = "http://localhost:3000"

    # S3 extended
    S3_REGION: str = "us-east-1"

    # Crypto
    KEY_ENCRYPTION_KEY: str = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

    # QR
    QR_TOKEN_EXPIRY_SECONDS: int = 30

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # GitHub OAuth
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/v1/github/oauth/callback"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
