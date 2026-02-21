"""Role-based access control decorators & helpers."""
from functools import wraps
from typing import Callable

from fastapi import HTTPException, status

# Role hierarchy (higher index = more privilege)
ROLE_HIERARCHY = {
    "VIEWER": 0,
    "CREDENTIAL_OFFICER": 1,
    "VERIFICATION_OFFICER": 2,
    "SUPER_ADMIN": 3,
}


def get_user_max_role(roles: list) -> str:
    """Return highest-privilege role from a user's role list."""
    if not roles:
        return "VIEWER"
    max_role = max(roles, key=lambda r: ROLE_HIERARCHY.get(r.role, 0))
    return max_role.role


def has_minimum_role(user_roles: list, required_role: str) -> bool:
    """Check whether user has at least the required role level."""
    required_level = ROLE_HIERARCHY.get(required_role, 0)
    for r in user_roles:
        if r.is_active and ROLE_HIERARCHY.get(r.role, 0) >= required_level:
            return True
    return False


def check_role(user, required_roles: list[str]):
    """Raise 403 if user doesn't have one of the required roles or user_type."""
    # Platform admins pass all checks
    if user.user_type == "PLATFORM_ADMIN":
        return

    # Institution admins: check role table
    if user.user_type == "INSTITUTION_ADMIN":
        for role in user.roles:
            if role.is_active and role.role in required_roles:
                return

    # Students with specific role requirements
    if user.user_type == "STUDENT" and "STUDENT" in required_roles:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Requires one of: {', '.join(required_roles)}",
    )
