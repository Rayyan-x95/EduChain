"""Logging middleware: request/response logging via structlog."""
import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = structlog.get_logger()


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        # Bind request context for structured logging
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        try:
            response = await call_next(request)
        except Exception:
            logger.exception("unhandled_exception")
            raise
        finally:
            elapsed = round((time.perf_counter() - start) * 1000, 2)
            logger.info(
                "request_completed",
                status=getattr(response, "status_code", 500) if "response" in dir() else 500,
                duration_ms=elapsed,
                client=request.client.host if request.client else None,
            )
            structlog.contextvars.unbind_contextvars("request_id", "method", "path")

        response.headers["X-Request-ID"] = request_id
        return response
