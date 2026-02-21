"""Common schemas: Pagination, ErrorResponse, SuccessResponse."""
from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel

T = TypeVar("T")


class Pagination(BaseModel):
    page: int = 1
    per_page: int = 20
    total: int = 0
    total_pages: int = 0


class PaginatedResponse(BaseModel, Generic[T]):
    status: str = "success"
    data: list[Any] = []
    pagination: Pagination


class SuccessResponse(BaseModel):
    status: str = "success"
    data: Any = None
    message: str = ""


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    code: str
    details: dict[str, Any] = {}


class IDResponse(BaseModel):
    id: UUID
