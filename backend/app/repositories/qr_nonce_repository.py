"""QR Nonce repository."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.qr_nonce import QRNonce


class QRNonceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, nonce: QRNonce) -> QRNonce:
        self.db.add(nonce)
        await self.db.flush()
        return nonce

    async def get_by_nonce(self, nonce: str) -> QRNonce | None:
        result = await self.db.execute(
            select(QRNonce).where(QRNonce.nonce == nonce)
        )
        return result.scalar_one_or_none()

    async def mark_consumed(self, nonce: str, ip_address: str | None = None) -> bool:
        record = await self.get_by_nonce(nonce)
        if not record or record.is_consumed:
            return False
        record.is_consumed = True
        record.consumed_at = datetime.now(timezone.utc)
        record.consumed_by_ip = ip_address
        await self.db.flush()
        return True

    async def cleanup_expired(self) -> int:
        """Remove expired, unconsumed nonces."""
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            delete(QRNonce).where(
                QRNonce.expires_at < now,
                QRNonce.is_consumed == False,
            )
        )
        return result.rowcount
