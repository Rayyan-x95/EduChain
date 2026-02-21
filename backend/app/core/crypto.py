"""ECDSA P-256 signing, verification, and key management."""
import base64
import hashlib
import json
import os

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config import settings
from app.core.kms import KMSClient


# -- Key Generation ------------------------------------------------------------
async def generate_keypair() -> tuple[str, str]:
    """Generate ECDSA P-256 keypair via KMS. Returns (kms_key_id, public_pem)."""
    return await KMSClient.create_key()


def compute_fingerprint(public_key_pem: str) -> str:
    """SHA-256 fingerprint of the DER-encoded public key."""
    public_key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"), default_backend())
    der = public_key.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return hashlib.sha256(der).hexdigest()


# -- Payload Signing -----------------------------------------------------------
def canonicalize(payload: dict) -> str:
    """Deterministic JSON canonicalization."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"))


def hash_payload(payload: dict) -> str:
    """SHA-256 hash of canonical JSON payload."""
    canonical = canonicalize(payload)
    return hashlib.sha256(canonical.encode()).hexdigest()


async def sign_payload(payload: dict, kms_key_id: str) -> str:
    """Sign a canonical JSON payload with ECDSA P-256 + SHA-256 via KMS. Returns base64 signature."""
    canonical = canonicalize(payload)
    return await KMSClient.sign(kms_key_id, canonical.encode("utf-8"))


async def verify_signature(payload: dict, signature_b64: str, public_key_pem: str) -> bool:
    """Verify an ECDSA signature against a canonical JSON payload."""
    canonical = canonicalize(payload)
    return await KMSClient.verify(public_key_pem, canonical.encode("utf-8"), signature_b64)

