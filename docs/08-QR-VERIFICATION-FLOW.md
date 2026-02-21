# QR Verification & Digital Signature Flow — EduLink

> Protocol: Short-lived, signed, single-use QR tokens  
> Crypto: ECDSA P-256 (SECP256R1) + SHA-256  
> Server-validated — no offline verification

---

## 1. QR Identity Verification (Student ID Sharing)

### Overview

A student can share their verified identity by generating a **short-lived QR code** that a verifier scans. The verifier's device calls the EduLink API to validate the token. The QR is:

- **Signed** by the institution's ECDSA private key
- **Nonce-protected** against replay
- **Time-bound** to 10 minutes
- **Single-use** — consumed on first successful scan

---

### Sequence Diagram

```
┌──────────┐                                          ┌──────────┐                                          ┌──────────────┐
│  Student  │                                          │  Verifier │                                          │  EduLink API  │
│  (App)    │                                          │  (Scanner)│                                          │  (FastAPI)    │
└─────┬────┘                                          └─────┬────┘                                          └──────┬───────┘
      │                                                     │                                                      │
      │  ① Tap "Share My ID"                                │                                                      │
      │  POST /api/v1/verify/qr/generate                    │                                                      │
      │─────────────────────────────────────────────────────────────────────────────────────────────────────────────►│
      │                                                     │                                                      │
      │                                                     │         ② Server-side processing:                    │
      │                                                     │         ┌────────────────────────────────────────────┐│
      │                                                     │         │ a. Verify student is VERIFIED              ││
      │                                                     │         │ b. Generate nonce = crypto_random(32)      ││
      │                                                     │         │ c. Build payload:                          ││
      │                                                     │         │    {sub, iid, nonce, iat, exp, type}       ││
      │                                                     │         │ d. hash = SHA-256(canonical(payload))      ││
      │                                                     │         │ e. sig = ECDSA_Sign(hash, inst_priv_key)   ││
      │                                                     │         │ f. token = b64url(header.payload.sig)      ││
      │                                                     │         │ g. INSERT nonce into qr_nonces table       ││
      │                                                     │         └────────────────────────────────────────────┘│
      │                                                     │                                                      │
      │  ③ Receive { qr_token, expires_at, ttl: 600s }     │                                                      │
      │◄───────────────────────────────────────────────────────────────────────────────────────────────────────────│
      │                                                     │                                                      │
      │  ④ Render QR code on screen                         │                                                      │
      │  ┌─────────────────────┐                            │                                                      │
      │  │ ┌─┐┌─┐      ┌─┐┌─┐  │                             │                                                      │
      │  │ └─┘└─┘      └─┘└─┘  │  10:00 countdown            │                                                      │
      │  │    ██████████      │                             │                                                      │
      │  │    ██████████      │                             │                                                      │
      │  │ ┌─┐┌─┐      ┌─┐┌─┐│                             │                                                      │
      │  │ └─┘└─┘      └─┘└─┘│                             │                                                      │
      │  └─────────────────────┘                            │                                                      │
      │                                                     │                                                      │
      │                          ⑤ Verifier scans QR        │                                                      │
      │                          (extracts token string)    │                                                      │
      │                                                     │                                                      │
      │                                                     │  ⑥ POST /api/v1/verify/qr/validate                   │
      │                                                     │  { "qr_token": "eyJ..." }                            │
      │                                                     │─────────────────────────────────────────────────────►│
      │                                                     │                                                      │
      │                                                     │         ⑦ Server validation:                         │
      │                                                     │         ┌────────────────────────────────────────────┐│
      │                                                     │         │ a. Decode base64url → header, payload, sig ││
      │                                                     │         │ b. Check exp > now()           → EXPIRED?  ││
      │                                                     │         │ c. Lookup nonce in qr_nonces   → EXISTS?   ││
      │                                                     │         │ d. Check is_consumed = FALSE   → REPLAY?   ││
      │                                                     │         │ e. Fetch inst public key (kid)             ││
      │                                                     │         │ f. hash = SHA-256(canonical(payload))      ││
      │                                                     │         │ g. ECDSA_Verify(hash, sig, pub_key)        ││
      │                                                     │         │ h. Check student status = VERIFIED         ││
      │                                                     │         │ i. Mark nonce consumed + log IP            ││
      │                                                     │         │ j. Audit log: QR_VERIFIED                  ││
      │                                                     │         └────────────────────────────────────────────┘│
      │                                                     │                                                      │
      │                                                     │  ⑧ Response: verification result                     │
      │                                                     │◄─────────────────────────────────────────────────────│
      │                                                     │                                                      │
      │                                                     │  Display:                                            │
      │                                                     │  ┌────────────────────────────┐                      │
      │                                                     │  │  ✅ VERIFIED STUDENT        │                      │
      │                                                     │  │                             │                      │
      │                                                     │  │  Name: Rayyan Ahmed        │                      │
      │                                                     │  │  Institution: MIT Bangalore │                      │
      │                                                     │  │  Program: B.Tech CS        │                      │
      │                                                     │  │  Year: 2024-2028           │                      │
      │                                                     │  │  Reputation: 78.5          │                      │
      │                                                     │  │                             │                      │
      │                                                     │  │  Verified at: 12:05:00 UTC │                      │
      │                                                     │  │  Signature: ✅ Valid         │                      │
      │                                                     │  └────────────────────────────┘                      │
```

---

### Token Structure (JWT-like)

```
Header (JSON, base64url-encoded):
{
  "alg": "ES256",
  "typ": "QR",
  "kid": "880e8400-e29b-41d4-a716-446655440000"   // signing key ID
}

Payload (JSON, base64url-encoded):
{
  "sub": "550e8400-...",                            // student_id
  "iid": "660e8400-...",                            // institution_id
  "nonce": "a1b2c3d4e5f67890abcdef1234567890...",  // 32-byte random hex
  "iat": 1740000000,                                // issued at (Unix)
  "exp": 1740000600,                                // expires at (iat + 600s)
  "type": "qr_verify"                               // token purpose
}

Signature:
  ECDSA_Sign(
    SHA-256( base64url(header) + "." + base64url(payload) ),
    institution_private_key
  )

Final Token:
  base64url(header) + "." + base64url(payload) + "." + base64url(signature)
```

---

### Validation Decision Tree

```
                        Receive QR Token
                              │
                              ▼
                    ┌─────────────────┐
                    │ Decode base64url│
                    │ Parse header +  │
                    │ payload + sig   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ exp > now() ?   │
                    └────┬───────┬────┘
                    NO   │       │ YES
                         ▼       ▼
                  ┌──────────┐  ┌──────────────────┐
                  │ EXPIRED  │  │ Lookup nonce in   │
                  │ (reject) │  │ qr_nonces table   │
                  └──────────┘  └────────┬─────────┘
                                         │
                                ┌────────▼────────┐
                                │ Nonce exists?    │
                                └────┬───────┬────┘
                                NO   │       │ YES
                                     ▼       ▼
                              ┌──────────┐  ┌──────────────────┐
                              │ INVALID  │  │ is_consumed?     │
                              │ (reject) │  └────┬───────┬─────┘
                              └──────────┘  TRUE │       │ FALSE
                                                 ▼       ▼
                                          ┌──────────┐  ┌──────────────────┐
                                          │ REPLAY   │  │ Fetch public key │
                                          │ ATTACK   │  │ by kid           │
                                          │ (reject  │  └────────┬─────────┘
                                          │ + alert) │           │
                                          └──────────┘  ┌────────▼────────┐
                                                        │ ECDSA_Verify(   │
                                                        │  hash, sig, pk) │
                                                        └────┬───────┬────┘
                                                        FAIL │       │ PASS
                                                             ▼       ▼
                                                      ┌──────────┐  ┌───────────────┐
                                                      │ FORGED   │  │ Check student │
                                                      │ (reject) │  │ status        │
                                                      └──────────┘  └────┬──────────┘
                                                                         │
                                                             ┌───────────┼──────────────┐
                                                             │           │              │
                                                          VERIFIED   SUSPENDED     BLACKLISTED
                                                             │           │              │
                                                             ▼           ▼              ▼
                                                         ┌────────┐ ┌────────┐    ┌────────┐
                                                         │ ✅ VALID│ │ ⚠️ SUSP │    │ 🚫 BAN │
                                                         │ Mark   │ │ Show   │    │ Show   │
                                                         │ nonce  │ │ warning│    │ blocked│
                                                         │ consumed│ └────────┘    └────────┘
                                                         └────────┘
```

---

## 2. Credential QR Sharing

Students can also share **individual credentials** via QR:

```
┌───────────────────────────────────────────────────────────────┐
│  Credential QR Sharing Flow                                    │
│                                                                │
│  1. Student selects credential in Vault                        │
│  2. Taps "Share via QR"                                        │
│  3. App calls POST /api/v1/verify/qr/generate                  │
│     with credential_id in payload                              │
│  4. Server builds credential-scoped QR token:                  │
│     {                                                          │
│       "sub": "student_id",                                     │
│       "iid": "institution_id",                                 │
│       "cid": "credential_id",        ← credential-specific     │
│       "nonce": "...",                                          │
│       "iat": ...,                                              │
│       "exp": ...,                                              │
│       "type": "credential_verify"     ← different type         │
│     }                                                          │
│  5. Verifier scans → API validates token + returns credential  │
│     details with signature validity and revocation status      │
└───────────────────────────────────────────────────────────── ──┘
```

---

## 3. Signed PDF Export Flow

```
Student requests PDF export
        │
        ▼
┌─────────────────────────────────────────┐
│  Server builds PDF:                      │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  EduLink Verified Credential       │  │
│  │                                    │  │
│  │  Student: Rayyan Ahmed             │  │
│  │  Institution: MIT Bangalore        │  │
│  │  Credential: B.Tech CS Sem 5      │  │
│  │  Issued: 2026-02-20               │  │
│  │  Status: ✅ Active                 │  │
│  │                                    │  │
│  │  ┌──────┐                          │  │
│  │  │ QR   │  ← Embedded verification │  │
│  │  │ Code │     URL with token        │  │
│  │  └──────┘                          │  │
│  │                                    │  │
│  │  Payload Hash: a1b2c3d4...         │  │
│  │  Signature: MEUCIQDx...            │  │
│  │  Key Fingerprint: SHA256:abc123... │  │
│  │                                    │  │
│  │  ─────────────────────────────     │  │
│  │  This credential was digitally     │  │
│  │  signed by MIT Bangalore.          │  │
│  │  Verify at: verify.edulink.dev     │  │
│  │  This is NOT a government-issued   │  │
│  │  identity document.                │  │
│  └────────────────────────────────────┘  │
│                                          │
│  PDF metadata includes:                  │
│    - payload_hash (SHA-256)              │
│    - signature (base64url ECDSA)         │
│    - signing_key_id                      │
│    - institution public key URL          │
└─────────────────────────────────────────┘
```

---

## 4. Implementation — Backend Service

```python
# app/services/verification_service.py

import hashlib
import json
import secrets
import time
from base64 import urlsafe_b64encode, urlsafe_b64decode
from datetime import datetime, timedelta, timezone
from uuid import UUID

from app.config import settings
from app.core.crypto import sign_payload, verify_signature
from app.repositories.qr_nonce_repository import QRNonceRepository
from app.repositories.signing_key_repository import SigningKeyRepository
from app.repositories.user_repository import UserRepository


class VerificationService:
    def __init__(self, db_session):
        self.nonce_repo = QRNonceRepository(db_session)
        self.key_repo = SigningKeyRepository(db_session)
        self.user_repo = UserRepository(db_session)

    async def generate_qr_token(
        self, student_id: UUID, institution_id: UUID
    ) -> dict:
        """Generate a short-lived, signed QR token for identity verification."""
        
        # 1. Verify student is eligible
        student = await self.user_repo.get_by_id(student_id)
        if student.status != "VERIFIED":
            raise ValueError("Only verified students can generate QR tokens")
        
        # 2. Get active signing key for institution
        signing_key = await self.key_repo.get_active_key(institution_id)
        
        # 3. Generate nonce
        nonce = secrets.token_hex(32)
        
        # 4. Build payload
        now = int(time.time())
        expires_at = now + (settings.QR_TOKEN_EXPIRY_MINUTES * 60)
        
        header = {
            "alg": "ES256",
            "typ": "QR",
            "kid": str(signing_key.id),
        }
        
        payload = {
            "sub": str(student_id),
            "iid": str(institution_id),
            "nonce": nonce,
            "iat": now,
            "exp": expires_at,
            "type": "qr_verify",
        }
        
        # 5. Sign
        message = (
            urlsafe_b64encode(json.dumps(header).encode()).decode()
            + "."
            + urlsafe_b64encode(json.dumps(payload).encode()).decode()
        )
        
        private_key = decrypt_private_key(signing_key.private_key_enc)
        signature = sign_payload_raw(
            message.encode(), private_key
        )
        
        token = message + "." + urlsafe_b64encode(signature).decode()
        
        # 6. Store nonce
        await self.nonce_repo.create(
            nonce=nonce,
            student_id=student_id,
            institution_id=institution_id,
            expires_at=datetime.fromtimestamp(expires_at, tz=timezone.utc),
        )
        
        return {
            "qr_token": token,
            "expires_at": datetime.fromtimestamp(expires_at, tz=timezone.utc).isoformat(),
            "ttl_seconds": settings.QR_TOKEN_EXPIRY_MINUTES * 60,
        }

    async def validate_qr_token(self, token: str, verifier_ip: str) -> dict:
        """Validate a scanned QR token. Returns verification result."""
        
        try:
            # 1. Parse token
            parts = token.split(".")
            if len(parts) != 3:
                return {"valid": False, "reason": "Malformed token", "code": "MALFORMED"}
            
            header = json.loads(urlsafe_b64decode(parts[0] + "=="))
            payload = json.loads(urlsafe_b64decode(parts[1] + "=="))
            signature = urlsafe_b64decode(parts[2] + "==")
            
            # 2. Check expiry
            if payload["exp"] < int(time.time()):
                return {"valid": False, "reason": "QR token has expired", "code": "TOKEN_EXPIRED"}
            
            # 3. Check nonce
            nonce_record = await self.nonce_repo.get_by_nonce(payload["nonce"])
            if not nonce_record:
                return {"valid": False, "reason": "Invalid token", "code": "INVALID_NONCE"}
            
            if nonce_record.is_consumed:
                # Potential replay attack — log alert
                await self._log_replay_attempt(payload, verifier_ip)
                return {"valid": False, "reason": "Token already used", "code": "REPLAY_DETECTED"}
            
            # 4. Verify signature
            signing_key = await self.key_repo.get_by_id(UUID(header["kid"]))
            message = parts[0] + "." + parts[1]
            
            is_valid = verify_signature_raw(
                message.encode(), signature, signing_key.public_key_pem.encode()
            )
            
            if not is_valid:
                return {"valid": False, "reason": "Invalid signature", "code": "INVALID_SIGNATURE"}
            
            # 5. Mark nonce consumed
            await self.nonce_repo.mark_consumed(
                nonce=payload["nonce"],
                consumed_by_ip=verifier_ip,
            )
            
            # 6. Fetch student data
            student = await self.user_repo.get_by_id(UUID(payload["sub"]))
            
            if student.status in ("SUSPENDED", "BLACKLISTED"):
                return {
                    "valid": False,
                    "reason": f"Student account is {student.status.lower()}",
                    "code": "ACCOUNT_INACTIVE",
                }
            
            # 7. Return verified result
            return {
                "valid": True,
                "student": {
                    "full_name": student.full_name,
                    "institution": student.institution.name,
                    "program": student.program,
                    "academic_year": student.academic_year,
                    "status": student.status,
                    "reputation_score": student.reputation_score.total_score,
                },
                "verification_timestamp": datetime.now(timezone.utc).isoformat(),
                "signature_valid": True,
            }
        
        except Exception as e:
            return {"valid": False, "reason": "Verification failed", "code": "INTERNAL_ERROR"}
```

---

## 5. Nonce Cleanup — Background Task

```python
# app/tasks/cleanup_tasks.py

from datetime import datetime, timedelta, timezone
from app.db.session import async_session_factory


async def cleanup_expired_nonces():
    """Delete expired and consumed QR nonces. Run hourly."""
    async with async_session_factory() as db:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
        result = await db.execute(
            "DELETE FROM qr_nonces WHERE expires_at < :cutoff",
            {"cutoff": cutoff}
        )
        await db.commit()
        return {"deleted": result.rowcount}
```

---

## 6. Security Properties Summary

| Property | How It's Achieved |
|---|---|
| **Authenticity** | ECDSA P-256 signature by institution's private key |
| **Integrity** | SHA-256 hash of canonical payload |
| **Freshness** | 10-minute expiration, server-checked |
| **Replay Protection** | Unique nonce, marked consumed after first use |
| **Non-Repudiation** | Institution's key signed it; audit log records issuance |
| **Privacy** | Only student_id + institution_id in token; full data returned only after server validation |
| **Revocation Awareness** | Server checks current student status at verification time |
