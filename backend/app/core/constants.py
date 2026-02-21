"""Application constants and enums."""

# ── User Statuses ──────────────────────────────────────────
USER_STATUSES = [
    "PENDING",
    "VERIFIED",
    "REJECTED",
    "FINAL_REJECTED",
    "SUSPENDED",
    "BLACKLISTED",
]

USER_TYPES = ["STUDENT", "INSTITUTION_ADMIN", "PLATFORM_ADMIN"]

# ── Role Names ─────────────────────────────────────────────
ROLE_NAMES = ["SUPER_ADMIN", "VERIFICATION_OFFICER", "CREDENTIAL_OFFICER", "VIEWER"]

# ── Credential ─────────────────────────────────────────────
CREDENTIAL_CATEGORIES = ["ACADEMIC", "INTERNSHIP", "EVENT", "CLUB", "RESEARCH"]
CREDENTIAL_STATUSES = ["ACTIVE", "EXPIRED", "REVOKED", "SUPERSEDED"]

# ── Key Statuses ───────────────────────────────────────────
KEY_STATUSES = ["ACTIVE", "ROTATED", "REVOKED"]

# ── Audit Actions ──────────────────────────────────────────
AUDIT_ACTIONS = [
    "USER_REGISTERED", "USER_LOGIN", "USER_LOGIN_FAILED",
    "EMAIL_VERIFIED", "PASSWORD_CHANGED",
    "STUDENT_APPROVED", "STUDENT_REJECTED", "STUDENT_SUSPENDED",
    "STUDENT_BLACKLISTED", "STUDENT_REINSTATED",
    "CREDENTIAL_ISSUED", "CREDENTIAL_REVOKED", "CREDENTIAL_UPDATED",
    "CREDENTIAL_EXPORTED",
    "KEY_GENERATED", "KEY_ROTATED", "KEY_REVOKED",
    "ROLE_ASSIGNED", "ROLE_REVOKED",
    "QR_TOKEN_GENERATED", "QR_VERIFIED", "QR_VERIFICATION_FAILED",
    "INSTITUTION_SETTINGS_UPDATED", "DATA_EXPORT_REQUESTED",
    "DATA_DELETION_REQUESTED",
]

# ── Subscription Tiers ─────────────────────────────────────
SUBSCRIPTION_TIERS = {
    "free": {"max_students": 50, "max_admins": 1, "api_access": False},
    "campus": {"max_students": 2000, "max_admins": 5, "api_access": False},
    "enterprise": {"max_students": None, "max_admins": None, "api_access": True},
}
