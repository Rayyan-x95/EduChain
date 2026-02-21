"""Import all models so Alembic can detect them."""
from app.models.base import Base  # noqa: F401
from app.models.institution import Institution  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.role import Role  # noqa: F401
from app.models.signing_key import SigningKey  # noqa: F401
from app.models.credential import Credential, CredentialVersion  # noqa: F401
from app.models.revocation import Revocation  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.blacklist import Blacklist  # noqa: F401
from app.models.qr_nonce import QRNonce  # noqa: F401
from app.models.consent import ConsentRecord  # noqa: F401
from app.models.badge import Badge, UserBadge  # noqa: F401
