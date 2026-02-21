# Security Architecture & Cryptographic Flows — EduLink

> Trust Model: PKI Digital Signature Based  
> Algorithm: ECDSA (SECP256R1 / P-256) + SHA-256  
> No blockchain — security through standard cryptographic primitives

---

## 1. Authentication & Authorization Flow

### JWT Token Architecture (RS256)

```
┌──────────────────────────────────────────────────────────────────┐
│                     JWT ACCESS TOKEN PAYLOAD                     │
├──────────────────────────────────────────────────────────────────┤
│  {                                                               │
│    "sub": "550e8400-e29b-41d4-a716-446655440000",  // user_id    │
│    "iss": "edulink",                                             │
│    "aud": "edulink-api",                                         │
│    "iat": 1740000000,                                            │
│    "exp": 1740001800,  // 30 min                                 │
│    "type": "access",                                             │
│    "institution_id": "660e8400-...",                             │
│    "user_type": "STUDENT",                                       │
│    "role": "VERIFICATION_OFFICER",  // if admin                  │
│    "status": "VERIFIED"                                          │
│  }                                                               │
│                                                                  │
│  Signed with: RS256 (RSA 2048-bit platform key)                  │
│  NOT the institution ECDSA key (those are for credentials only)  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    JWT REFRESH TOKEN PAYLOAD                     │
├──────────────────────────────────────────────────────────────────┤
│  {                                                               │
│    "sub": "550e8400-...",                                        │
│    "type": "refresh",                                            │
│    "jti": "unique-token-id",  // for revocation                  │
│    "exp": 1740604800  // 7 days                                  │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
```

### Authorization Middleware Chain

```
Request
  │
  ▼
┌─────────────────┐
│ Rate Limiter     │  Redis: 60 req/min per IP, 200 req/min per user
│ (pre-auth)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JWT Validation   │  1. Extract Bearer token
│                  │  2. Verify RS256 signature
│                  │  3. Check expiry
│                  │  4. Extract claims
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Status      │  Reject if: SUSPENDED, BLACKLISTED
│ Check            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Role Check       │  Compare user role against endpoint requirements
│ (RBAC)           │  SuperAdmin > VerificationOfficer > CredentialOfficer > Viewer
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Institution      │  Inject institution_id into all DB queries
│ Scoping          │  Prevents cross-tenant data access
└────────┬────────┘
         │
         ▼
  Route Handler
```

---

## 2. Password Security

```
Registration Flow:
  1. Client sends password in TLS-encrypted request
  2. Server validates: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
  3. Server hashes: bcrypt(password, cost=12)
  4. Store hash only — password never stored in plaintext
  5. Rate-limit registration: 5 attempts per email per hour

Login Flow:
  1. Client sends email + password
  2. Server: bcrypt.verify(password, stored_hash)
  3. On failure: increment counter, log attempt with IP
  4. After 5 failures: 15-minute lockout
  5. On success: generate JWT pair, log successful login
```

---

## 3. Digital Signature System (ECDSA P-256)

### Key Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│                        KEY HIERARCHY                              │
│                                                                   │
│  Platform Level (JWT signing):                                    │
│    RSA 2048-bit key pair (for JWT RS256)                          │
│    Managed by: Platform infrastructure                            │
│    Rotation: Annual                                               │
│                                                                   │
│  Institution Level (Credential signing):                          │
│    ECDSA P-256 (SECP256R1) key pair                               │
│    One ACTIVE key per institution at any time                     │
│    Historical keys retained for verification                      │
│    Rotation: On-demand by SuperAdmin                              │
│                                                                   │
│  Per-Key Storage:                                                 │
│    Public Key  → Stored as PEM in DB (publicly accessible)        │
│    Private Key → Encrypted with AES-256-GCM before DB storage     │
│    Encryption Key → From environment variable (HSM in production) │
│    Fingerprint → SHA-256(DER-encoded-public-key)                  │
└──────────────────────────────────────────────────────────────────┘
```

### Private Key Encryption at Rest

```python
# How private keys are stored in the database

import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def encrypt_private_key(private_key_pem: bytes) -> tuple[bytes, bytes]:
    """Encrypt private key with AES-256-GCM before database storage."""
    # Master key from environment (32 bytes = 256 bits)
    master_key = bytes.fromhex(os.environ["KEY_ENCRYPTION_KEY"])
    
    # Generate random nonce (96 bits)
    nonce = os.urandom(12)
    
    # Encrypt
    aesgcm = AESGCM(master_key)
    ciphertext = aesgcm.encrypt(nonce, private_key_pem, None)
    
    # Store as: base64(nonce || ciphertext)
    return nonce + ciphertext

def decrypt_private_key(encrypted_data: bytes) -> bytes:
    """Decrypt private key from database."""
    master_key = bytes.fromhex(os.environ["KEY_ENCRYPTION_KEY"])
    
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    
    aesgcm = AESGCM(master_key)
    return aesgcm.decrypt(nonce, ciphertext, None)
```

### Credential Signing — Complete Flow

```
┌───────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Build Canonical Payload                                          │
│                                                                           │
│  payload = {                                                              │
│    "credential_id": "770e8400-...",                                       │
│    "student_id": "550e8400-...",                                          │
│    "institution_id": "660e8400-...",                                      │
│    "category": "ACADEMIC",                                                │
│    "title": "B.Tech CS Semester 5 Completion",                            │
│    "metadata": {"cgpa": 8.7, "semester": 5},                              │
│    "version": 1,                                                          │
│    "issued_at": "2026-02-20T10:00:00Z",                                   │
│    "expires_at": "2030-02-20T00:00:00Z"                                   │
│  }                                                                        │
│                                                                           │
│  canonical_json = json.dumps(payload, sort_keys=True, separators=(',',':'))  │
│  // Deterministic — same payload always produces same string              │
└───────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Compute Hash                                                     │
│                                                                           │
│  payload_hash = SHA-256(canonical_json.encode('utf-8'))                    │
│  // 32 bytes = 64 hex characters                                          │
│  // Example: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234" │
└───────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Sign with Institution's ECDSA Private Key                        │
│                                                                           │
│  1. Decrypt private key from database (AES-256-GCM)                       │
│  2. Load as ECDSA P-256 private key                                       │
│  3. signature = ECDSA_Sign(payload_hash, private_key)                     │
│  4. Encode: base64url(signature)                                          │
│  5. Immediately clear private key from memory                             │
│  6. Record signing_key_id in credential row                               │
└───────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Store                                                            │
│                                                                           │
│  credentials table:                                                       │
│    payload_hash    = "a1b2c3d4..."  (hex)                                 │
│    signature       = "MEUCIQDx..."  (base64url)                           │
│    signing_key_id  = "880e8400-..." (FK to signing_keys)                  │
│                                                                           │
│  credential_versions table:                                               │
│    version = 1                                                            │
│    payload = { full JSON }                                                │
│    payload_hash, signature, signing_key_id (snapshot)                     │
│                                                                           │
│  audit_logs table:                                                        │
│    action = 'CREDENTIAL_ISSUED'                                           │
│    details = { credential_id, student_id, issued_by }                     │
└───────────────────────────────────────────────────────────────────────────┘
```

### Credential Verification — Complete Flow

```
Verifier receives: credential_id OR QR-encoded data
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Fetch credential data                                    │
│     GET /api/v1/credentials/{id}/verify                      │
│     Returns: payload, payload_hash, signature, key_id        │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Fetch institution public key                             │
│     GET /api/v1/institutions/{id}/keys/{key_id}              │
│     Returns: public_key_pem, algorithm, status               │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Recompute hash                                           │
│     computed_hash = SHA-256(canonical_json(payload))          │
│     Verify: computed_hash == stored payload_hash             │
│     If mismatch → TAMPERED                                   │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Verify ECDSA signature                                   │
│     result = ECDSA_Verify(                                   │
│       message = computed_hash,                               │
│       signature = decode_base64url(signature),               │
│       public_key = load_pem(public_key_pem)                  │
│     )                                                        │
│     If invalid → FORGED                                      │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Check revocation registry                                │
│     SELECT * FROM revocations WHERE credential_id = ?        │
│     If found → REVOKED (with reason + date)                  │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Check expiry                                             │
│     If expires_at IS NOT NULL AND expires_at < NOW()         │
│     → EXPIRED                                                │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
               ┌─────────────────────────────────────┐
               │  Final Verdict:                      │
               │    ✅ VALID                           │
               │    ❌ INVALID (tampered/forged)       │
               │    🔴 REVOKED                         │
               │    ⏰ EXPIRED                          │
               └─────────────────────────────────────┘
```

---

## 4. QR Token Security

### Token Structure

```json
{
  "header": {
    "alg": "ES256",
    "kid": "880e8400-..."
  },
  "payload": {
    "sub": "550e8400-...",        // student_id
    "iid": "660e8400-...",        // institution_id
    "nonce": "a1b2c3d4e5f6...",   // unique, single-use
    "iat": 1740000000,            // issued at
    "exp": 1740000600,            // expires (10 min)
    "type": "qr_verify"
  },
  "signature": "ECDSA(SHA-256(header.payload), institution_private_key)"
}
```

### Security Properties

| Property | Implementation |
|---|---|
| **Short-lived** | 10-minute expiration, server-enforced |
| **Single-use** | Nonce stored in `qr_nonces` table; consumed on first use |
| **Signed** | ECDSA P-256 signature by institution key |
| **Server-validated** | QR cannot be verified offline; requires API call |
| **Replay-proof** | Nonce + expiry + consumed flag |
| **Non-forgeable** | Requires institution private key to create |

### QR Nonce Lifecycle

```
Generate QR:
  1. nonce = crypto_random(32 bytes) → hex
  2. Insert into qr_nonces (nonce, student_id, expires_at, is_consumed=FALSE)
  3. Build payload → Sign → Encode as base64url → Generate QR image
  4. Return QR to student (10 min TTL)

Validate QR:
  1. Decode base64url token
  2. Parse header + payload
  3. Check expiry (exp < now → EXPIRED)
  4. Lookup nonce in qr_nonces
  5. If not found → INVALID
  6. If is_consumed = TRUE → REPLAY_ATTACK (reject + log)
  7. Verify ECDSA signature using institution public key
  8. Mark nonce as consumed (UPDATE SET is_consumed = TRUE, consumed_at = NOW())
  9. Fetch student data, return verification result

Cleanup (periodic job):
  DELETE FROM qr_nonces WHERE expires_at < NOW() - INTERVAL '1 hour'
```

---

## 5. Backend Security Layers

### Rate Limiting Configuration

```python
# Redis-backed sliding window rate limiter

RATE_LIMITS = {
    # Global (per IP)
    "global": {"requests": 60, "window_seconds": 60},
    
    # Auth endpoints (stricter)
    "auth:login": {"requests": 5, "window_seconds": 300},
    "auth:register": {"requests": 3, "window_seconds": 3600},
    "auth:forgot-password": {"requests": 3, "window_seconds": 3600},
    
    # Endorsements (business rule)
    "endorsements:create": {"requests": 3, "window_seconds": 86400},  # 3/day
    
    # QR generation
    "qr:generate": {"requests": 10, "window_seconds": 60},
    
    # Recruiter search
    "recruiter:search": {"requests": 30, "window_seconds": 60},
    
    # Admin operations (generous but logged)
    "admin:keys": {"requests": 5, "window_seconds": 3600},
}
```

### CORS Configuration

```python
CORS_CONFIG = {
    "allow_origins": [
        "https://admin.edulink.dev",       # Admin panel
        "https://recruiter.edulink.dev",   # Recruiter dashboard
    ],
    "allow_methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    "allow_headers": ["Authorization", "Content-Type", "X-Request-ID"],
    "allow_credentials": True,
    "max_age": 3600,  # 1 hour preflight cache
}

# Mobile apps: No CORS needed (not browser-based)
# Development: Add localhost:3000, localhost:8080
```

### Input Validation Strategy

```
Layer 1: Pydantic Schema Validation
  - Type checking (automatic)
  - String length limits (max_length)
  - Regex patterns (email, enrollment number)
  - Enum constraints (status values)
  - Custom validators (@field_validator)

Layer 2: Business Logic Validation
  - Enrollment number uniqueness check
  - Appeal window enforcement
  - Endorsement rate limiting
  - Role permission checks

Layer 3: Database Constraints
  - UNIQUE constraints
  - CHECK constraints
  - Foreign key constraints
  - NOT NULL constraints

Layer 4: PostgreSQL RLS
  - Row-level security policies
  - Institution scoping at database level
```

### Structured Logging Format

```json
{
  "timestamp": "2026-02-20T10:00:00.123Z",
  "level": "INFO",
  "logger": "edulink.api",
  "message": "Credential issued",
  "request_id": "req_abc123",
  "user_id": "550e8400-...",
  "institution_id": "660e8400-...",
  "action": "CREDENTIAL_ISSUED",
  "target": {
    "type": "credential",
    "id": "770e8400-..."
  },
  "client_ip": "203.0.113.42",
  "user_agent": "EduLink-Flutter/1.0.0",
  "duration_ms": 145,
  "status_code": 201
}
```

---

## 6. Mobile Security Checklist

| Category | Measure | Implementation |
|---|---|---|
| Storage | Secure token storage | `flutter_secure_storage` (Keychain/Keystore) |
| Storage | Encrypted local DB | SQLCipher via `sqflite_sqlcipher` |
| Auth | Biometric lock | `local_auth` (fingerprint/face) |
| Auth | Auto-logout | Token expiry check on app resume |
| Network | TLS 1.3 | Enforced via `SecurityContext` |
| Network | Certificate pinning | Custom `badCertificateCallback` in Dio |
| Network | No sensitive data in logs | Strip auth headers from Dio logger |
| Integrity | Root detection | `root_checker_plus` at startup |
| Integrity | No debug builds in production | Build flags, ProGuard/R8 |
| Data | No sensitive data in screenshots | `secure` flag on `FlutterActivity` |
| Data | Clear clipboard after paste | Timed clipboard clear for tokens |

---

## 7. Key Rotation Protocol

```
┌──────────────────────────────────────────────────────────────┐
│  KEY ROTATION PROCEDURE                                       │
│                                                               │
│  Pre-conditions:                                              │
│    - Actor must have SUPER_ADMIN role                         │
│    - Current active key exists                                │
│                                                               │
│  Steps:                                                       │
│    1. SuperAdmin triggers rotation via Admin Panel             │
│    2. Server generates new ECDSA P-256 keypair                │
│    3. New private key encrypted with AES-256-GCM              │
│    4. Transaction:                                            │
│       a. UPDATE old key: status = 'ROTATED', rotated_at = NOW │
│       b. INSERT new key: status = 'ACTIVE'                    │
│    5. Audit log: KEY_ROTATED (old_key_id, new_key_id)         │
│    6. Old key remains queryable for verification              │
│    7. New credentials use new key                             │
│    8. All existing credentials remain valid (verify via old)  │
│                                                               │
│  Rollback:                                                    │
│    - Old key can be reactivated if needed (SuperAdmin only)   │
│    - All operations are transactional                         │
│                                                               │
│  Schedule recommendation:                                     │
│    - Routine rotation: every 6-12 months                      │
│    - Emergency rotation: if key compromise suspected          │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Threat Model Summary

| Threat | Mitigation |
|---|---|
| Credential Forgery | ECDSA P-256 signature verification |
| QR Replay Attack | Single-use nonces, 10-min expiry |
| Cross-Tenant Data Leak | PostgreSQL RLS + API-layer scoping |
| Brute Force Login | Rate limiting + account lockout |
| JWT Theft | Short-lived tokens (30 min) + refresh rotation |
| Private Key Compromise | AES-256-GCM encryption at rest, HSM in production |
| Man-in-the-Middle | TLS 1.3 + certificate pinning (mobile) |
| SQL Injection | Parameterized queries via SQLAlchemy ORM |
| XSS (Admin Panel) | React auto-escaping + CSP headers |
| CSRF | SameSite cookies + CSRF tokens |
| Rooted Device | Root detection + refusal to store sensitive data |
| Data Leak via Logs | Structured logging, no PII in logs |
| Privilege Escalation | RBAC at API layer + DB-level constraints |
