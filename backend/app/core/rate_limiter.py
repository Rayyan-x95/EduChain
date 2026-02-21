"""Redis-backed rate limiter."""
import time
from typing import Optional

import redis.asyncio as redis

from app.config import settings


class RateLimiter:
    """Sliding-window rate limiter backed by Redis."""

    def __init__(self):
        self._redis: Optional[redis.Redis] = None

    async def get_redis(self) -> redis.Redis:
        if self._redis is None:
            self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis

    async def is_rate_limited(
        self,
        key: str,
        max_requests: int = 60,
        window_seconds: int = 60,
    ) -> bool:
        """Return True if rate limit exceeded for the given key."""
        r = await self.get_redis()
        now = time.time()
        pipe = r.pipeline()

        # Remove old entries
        pipe.zremrangebyscore(key, 0, now - window_seconds)
        # Add current request
        pipe.zadd(key, {str(now): now})
        # Count requests in window
        pipe.zcard(key)
        # Set expiry on the key
        pipe.expire(key, window_seconds)

        results = await pipe.execute()
        request_count = results[2]

        return request_count > max_requests

    async def check_endorsement_limit(self, user_id: str) -> bool:
        """Check if user exceeded 3 endorsements per day."""
        key = f"endorse_limit:{user_id}"
        return await self.is_rate_limited(key, max_requests=3, window_seconds=86400)

    async def close(self):
        if self._redis:
            await self._redis.close()


rate_limiter = RateLimiter()
