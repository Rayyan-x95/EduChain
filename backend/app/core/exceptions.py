"""Custom exception classes."""
from typing import Any


class EduLinkError(Exception):
    """Base exception for EduLink."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR", status_code: int = 500, details: dict[str, Any] | None = None):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class NotFoundError(EduLinkError):
    def __init__(self, resource: str, resource_id: str | None = None):
        detail = f"{resource} not found" + (f": {resource_id}" if resource_id else "")
        super().__init__(message=detail, code="NOT_FOUND", status_code=404)


class ConflictError(EduLinkError):
    def __init__(self, message: str, code: str = "CONFLICT"):
        super().__init__(message=message, code=code, status_code=409)


class ForbiddenError(EduLinkError):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message=message, code="FORBIDDEN", status_code=403)


class UnauthorizedError(EduLinkError):
    def __init__(self, message: str = "Invalid or expired token"):
        super().__init__(message=message, code="UNAUTHORIZED", status_code=401)


class ValidationError(EduLinkError):
    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(message=message, code="VALIDATION_ERROR", status_code=400, details=details)


class RateLimitError(EduLinkError):
    def __init__(self, message: str = "Too many requests"):
        super().__init__(message=message, code="RATE_LIMIT_EXCEEDED", status_code=429)
