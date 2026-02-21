"""Redis client for rate limiting and JWT blocklist."""
import redis.asyncio as redis
from app.config import settings

# Initialize Redis connection pool
redis_client = redis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
    max_connections=10
)

async def add_token_to_blocklist(jti: str, expires_in: int):
    """Add a JWT ID to the blocklist with an expiration time."""
    await redis_client.setex(f"blocklist:{jti}", expires_in, "true")

async def is_token_blocklisted(jti: str) -> bool:
    """Check if a JWT ID is in the blocklist."""
    return await redis_client.exists(f"blocklist:{jti}") > 0
