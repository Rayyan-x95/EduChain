"""Storage service: S3-compatible file upload/download via aioboto3."""
import uuid
from datetime import datetime, timezone

import aioboto3
from botocore.config import Config as BotoConfig

from app.config import settings


class StorageService:
    def __init__(self):
        self.session = aioboto3.Session()
        self.bucket = settings.S3_BUCKET

    def _client_kwargs(self) -> dict:
        return {
            "endpoint_url": settings.S3_ENDPOINT,
            "aws_access_key_id": settings.S3_ACCESS_KEY,
            "aws_secret_access_key": settings.S3_SECRET_KEY,
            "region_name": settings.S3_REGION,
            "config": BotoConfig(signature_version="s3v4"),
        }

    async def upload(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str = "application/octet-stream",
        folder: str = "uploads",
    ) -> str:
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
        key = f"{folder}/{datetime.now(timezone.utc).strftime('%Y/%m/%d')}/{uuid.uuid4().hex}.{ext}"

        async with self.session.client("s3", **self._client_kwargs()) as s3:
            await s3.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )
        return key

    async def get_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        async with self.session.client("s3", **self._client_kwargs()) as s3:
            url = await s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )
        return url

    async def delete(self, key: str) -> None:
        async with self.session.client("s3", **self._client_kwargs()) as s3:
            await s3.delete_object(Bucket=self.bucket, Key=key)
