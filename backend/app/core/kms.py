"""Mock AWS KMS Client for ECDSA P-256 signing."""
import base64
import hashlib
import json
import uuid
import asyncio
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec

# In a real implementation, this would use boto3 to call AWS KMS.
# For this mock, we store keys in memory.
_mock_kms_storage = {}
_kms_cache = {}

class KMSClient:
    @staticmethod
    async def create_key() -> tuple[str, str]:
        """Creates an asymmetric ECDSA P-256 key in KMS. Returns (key_id, public_key_pem)."""
        # Simulate network delay
        await asyncio.sleep(0.05)
        key_id = str(uuid.uuid4())
        private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
        
        public_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode('utf-8')
        
        _mock_kms_storage[key_id] = private_key
        return key_id, public_pem

    @staticmethod
    async def sign(key_id: str, message: bytes) -> str:
        """Signs a message using the specified KMS key. Returns base64 signature."""
        # Simulate network delay
        await asyncio.sleep(0.05)
        if key_id not in _mock_kms_storage:
            raise ValueError(f"KMS Key {key_id} not found.")
            
        private_key = _mock_kms_storage[key_id]
        
        # KMS typically signs the digest
        digest = hashlib.sha256(message).digest()
        signature = private_key.sign(digest, ec.ECDSA(hashes.SHA256()))
        
        return base64.b64encode(signature).decode('utf-8')

    @staticmethod
    async def verify(public_key_pem: str, message: bytes, signature_b64: str) -> bool:
        """Verifies a signature using the public key."""
        # Cache public keys to avoid parsing PEM repeatedly
        cache_key = hashlib.sha256(public_key_pem.encode('utf-8')).hexdigest()
        if cache_key in _kms_cache:
            public_key = _kms_cache[cache_key]
        else:
            try:
                public_key = serialization.load_pem_public_key(
                    public_key_pem.encode('utf-8'), default_backend()
                )
                _kms_cache[cache_key] = public_key
            except Exception:
                return False

        try:
            digest = hashlib.sha256(message).digest()
            signature = base64.b64decode(signature_b64)
            
            public_key.verify(signature, digest, ec.ECDSA(hashes.SHA256()))
            return True
        except Exception:
            return False
