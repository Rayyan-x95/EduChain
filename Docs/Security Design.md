# Security Design Document

**Product:** EduChain ID
**Date:** March 2026
**Status:** Active Development

---

## 1. Security Overview

The EduChain ID platform must ensure:

- **User identity protection** — via Supabase Auth and encrypted storage
- **Credential authenticity** — via RSA digital signatures
- **Data confidentiality** — via encryption, access controls, and privacy settings
- **Access control enforcement** — via RBAC middleware
- **Fraud prevention** — via institution verification and audit trails

Security is implemented across five layers:

1. **Network Security** — TLS everywhere, CORS restrictions
2. **Application Security** — authentication, authorization, input validation
3. **Data Security** — encryption at rest and in transit, privacy controls
4. **Credential Integrity** — RSA-2048 signatures, SHA-256 hashing
5. **Operational Security** — logging, monitoring, incident response

---

## 2. Security Architecture

```
Client Apps
     │
HTTPS / TLS 1.3
     │
Supabase Auth
(Google OAuth + Email/Password)
     │
Supabase JWT
     │
Fastify API Server
     │
┌────────────────────────────────────────────┐
│  authenticateToken (Supabase JWT verify)   │
│  authorizeRole (RBAC enforcement)          │
│  validateBody (Zod schema validation)      │
│  @fastify/helmet (security headers)        │
│  @fastify/rate-limit (request throttling)  │
│  errorHandler (sanitized responses)        │
└────────────────────────────────────────────┘
     │
Backend Domain Modules
     │
┌──────────────┬──────────────┬──────────────┐
│ Supabase     │ Upstash      │ Supabase     │
│ PostgreSQL   │ Redis (TLS)  │ Storage      │
│ (encrypted)  │              │ (signed URLs)│
└──────────────┴──────────────┴──────────────┘
     │
RSA Credential Verification Layer
```

Each layer enforces independent security protections.

---

## 3. Authentication Security

### Supabase Auth

Authentication is fully managed by **Supabase Auth**. The API does not issue identity tokens — it verifies Supabase-issued JWTs.

**Supported methods:**
- Email/password (via `supabase.auth.signUp()` / `signInWithPassword()`)
- Google OAuth (via `supabase.auth.signInWithOAuth({ provider: 'google' })`)

### Token Structure

| Token | Issuer | Lifetime | Purpose |
|---|---|---|---|
| Access Token (JWT) | Supabase Auth | ~1 hour | API request authentication |
| Refresh Token | Supabase Auth | 7 days | Session renewal |
| App Refresh Token | API server | 7 days | Internal token refresh (legacy support) |

### JWT Verification Flow

```
1. Client sends: Authorization: Bearer <supabase-jwt>
2. authenticateToken middleware:
   a. Extract Bearer token
   b. jwt.verify(token, SUPABASE_JWT_SECRET)
   c. Extract email from decoded payload
   d. prisma.user.findUnique({ where: { email } })
   e. Attach { userId, email, role } to request.user
3. If verification fails → 401 Unauthorized
```

### Token Storage Security

| Platform | Storage | Encryption |
|---|---|---|
| Mobile (Expo) | expo-secure-store | AES-256 (iOS Keychain / Android Keystore) |
| Web (Next.js) | Supabase client (in-memory) | Browser memory (not localStorage for tokens) |
| API | Stateless | No token storage — verifies each request |

---

## 4. Password Security

Passwords are hashed using **Argon2** (memory-hard, resistant to GPU attacks).

**Implementation:** `apps/api/src/lib/password.ts`

- Passwords are never stored in plaintext
- Argon2 is the default algorithm (not bcrypt)
- No password is logged or included in error responses

**Password requirements:**
- Minimum 8 characters
- Enforced by Zod schema validation at the API boundary

---

## 5. Role-Based Access Control (RBAC)

### Roles

| Role | Description |
|---|---|
| `student` | Manage own profile, view credentials, collaborate, search |
| `institution_admin` | Verify students, issue/revoke credentials |
| `recruiter` | Browse profiles, verify credentials, shortlist |
| `platform_admin` | Full system administration |

### Authorization Flow

```
authenticateToken middleware
    ├─ Verifies Supabase JWT
    ├─ Resolves user from DB (gets role)
    └─ Attaches request.user
         │
authorizeRole(['institution_admin']) middleware
    ├─ Checks request.user.role
    ├─ If role not in allowed list → 403 Forbidden
    └─ If authorized → proceed to handler
```

### Permission Matrix

| Action | student | institution_admin | recruiter | platform_admin |
|---|---|---|---|---|
| Edit own profile | ✅ | ❌ | ❌ | ✅ |
| View public profiles | ✅ | ✅ | ✅ | ✅ |
| Issue credentials | ❌ | ✅ | ❌ | ✅ |
| Revoke credentials | ❌ | ✅ | ❌ | ✅ |
| Verify credentials | ✅ | ✅ | ✅ | ✅ |
| Search students | ✅ | ✅ | ✅ | ✅ |
| Shortlist students | ❌ | ❌ | ✅ | ✅ |
| Approve verifications | ❌ | ✅ | ❌ | ✅ |
| View audit logs | ❌ | ✅ | ❌ | ✅ |

---

## 6. API Security

### Transport Security

- All communication uses **HTTPS (TLS 1.3)** enforced at deployment platform level
- Supabase connections use TLS
- Upstash Redis uses `rediss://` protocol (TLS)

### Security Headers

**@fastify/helmet** provides:
- `Content-Security-Policy` — restricts resource loading
- `Strict-Transport-Security` — enforces HTTPS
- `X-Frame-Options` — prevents clickjacking
- `X-Content-Type-Options` — prevents MIME sniffing
- `Referrer-Policy` — controls referrer information

### Rate Limiting

**@fastify/rate-limit** configuration:
- Global limit: **300 requests per minute per IP**
- Custom error response: `{ success: false, error: 'Too many requests' }`
- Purpose: prevent brute-force attacks, API abuse, DDoS mitigation

### CORS Policy

```
Production: Strict origin allowlist (CORS_ORIGIN env var)
  - https://educhain.com
  - https://app.educhain.com

Development: Open (all origins)

Credentials: true (cookies/auth headers allowed)
```

### Body Size Limit

- Default: **10 KB** max body size
- Prevents oversized payload attacks
- Configurable per route for upload endpoints

### Request ID Tracking

- `x-request-id` header propagated or auto-generated (UUID)
- Used for distributed tracing and log correlation

---

## 7. Credential Integrity Protection

Academic credentials are tamper-proof through RSA digital signatures.

### Credential Signing Model

```
Credential Data (JSON)
        │
        ▼
Deterministic serialization (sorted keys)
        │
        ▼
SHA-256 Hash → credential_hash
        │
        ▼
RSA-SHA256 Sign(hash, institution_private_key) → signature
        │
        ▼
Store: credential_hash + signature in credentials table
```

### Fields Stored

| Field | Purpose |
|---|---|
| `credential_hash` | SHA-256 hex hash of credential JSON |
| `signature` | RSA-SHA256 base64 signature |
| `status` | active / revoked |

### Verification Process

```
1. Retrieve credential record
2. Retrieve institution public key (PEM)
3. Recompute SHA-256 hash from credential data
4. crypto.createVerify('RSA-SHA256').verify(publicKey, signature, 'base64')
5. Check credential.status !== 'revoked'
6. Return verification result
```

### Key Specifications

| Aspect | Value |
|---|---|
| Key Algorithm | RSA-2048 |
| Hash Algorithm | SHA-256 |
| Signature Algorithm | RSA-SHA256 |
| Key Encoding | PEM (SPKI for public, PKCS8 for private) |
| Signature Encoding | Base64 |

---

## 8. Institution Verification

To prevent fake institutions from issuing credentials:

### Verification Process

```
1. Institution applies for registration
2. Domain verification (institution.domain)
3. Manual approval by platform admin
4. RSA key pair generated on approval
5. Public key stored in institutions table
6. Private key reference stored (private_key_ref)
```

### Requirements

- Verified institution domain
- Official email addresses
- Platform admin approval required
- RSA key pair generated ONLY after verification

---

## 9. Data Privacy Protection

### Sensitive Data

| Data Type | Classification |
|---|---|
| Student identity | Personal (protected) |
| Academic records | Sensitive (access-controlled) |
| Credentials / signatures | High-integrity (tamper detection) |
| Passwords | Secret (hashed, never stored plain) |
| RSA private keys | Critical (isolated storage) |

### Privacy Levels

Students control their profile visibility:

| Level | Visible To |
|---|---|
| `public` | All authenticated users |
| `recruiter_only` | Recruiters and institution admins |
| `private` | Only the student themselves |

**Enforcement:** Privacy is enforced at the database query level — queries filter results based on the requesting user's role.

### Data Minimization

- Only necessary data is collected
- Credentials contain minimal identifying information
- Audit logs capture action metadata, not full data payloads

---

## 10. Input Validation

All user inputs are validated using **Zod schemas** via the `validateBody` middleware.

### Protection Against

| Attack | Mitigation |
|---|---|
| SQL Injection | Prisma ORM (parameterized queries by default) |
| XSS | Input validation + @fastify/helmet CSP headers |
| NoSQL Injection | Not applicable (PostgreSQL only) |
| Mass Assignment | Zod schemas whitelist allowed fields |
| Buffer Overflow | Body size limits (10 KB default) |

### Validation Flow

```
Request body
    │
    ▼
validateBody(zodSchema) middleware
    │
    ├─ Zod parse → strips unknown fields
    ├─ If valid → proceed
    ├─ If invalid → 400 with validation errors
```

---

## 11. Secure File Storage

**Provider:** Supabase Storage

### Security Measures

| Control | Implementation |
|---|---|
| Bucket Access | Private (no public listing) |
| File Access | Signed URLs (time-limited, per-file) |
| Upload Validation | File type and size limits enforced server-side |
| Storage Encryption | Supabase managed encryption at rest |
| Upload Auth | Requires valid Supabase JWT |

### Accepted File Types
- Certificates: PDF, PNG, JPG
- Avatars: PNG, JPG, WebP
- Maximum size: Configurable per-route

---

## 12. Logging & Monitoring

### Security Event Logging

All security-relevant events are logged:

| Event | Log Level | Details |
|---|---|---|
| Successful login | info | userId, method (OAuth/email) |
| Failed login | warn | email, reason |
| Credential issuance | info | actorId, credentialId, studentId |
| Credential revocation | warn | actorId, credentialId, reason |
| Authorization failure | warn | userId, role, endpoint |
| Rate limit exceeded | warn | IP address, endpoint |
| Verification request | info | credentialId, result |

### Tools

| Tool | Purpose |
|---|---|
| Pino | Structured JSON application logs |
| Sentry | Error tracking with context (userId, endpoint) |
| Audit Log table | Immutable DB record of sensitive operations |

### Audit Trail (audit_logs Table)

Every sensitive operation writes to the audit log:
- `actorId` — who performed the action
- `actorRole` — their role at the time
- `action` — what was done (e.g., `credential.issue`, `credential.revoke`)
- `entityType` + `entityId` — what was affected
- `metadata` — additional context (JSON)
- `createdAt` — when it happened

---

## 13. Fraud Detection

### Threat Scenarios

| Threat | Mitigation |
|---|---|
| Fake credentials | RSA signature verification (computationally infeasible to forge) |
| Fake institutions | Platform admin approval + domain verification |
| Account takeover | Supabase Auth handles rate limiting + suspicious login detection |
| Credential replay | Unique credential IDs + revocation status checking |
| API abuse | Rate limiting + authentication required for sensitive endpoints |

---

## 14. Backup & Recovery

### Database Backups
- **Provider:** Supabase managed automatic backups
- **Frequency:** Continuous (point-in-time recovery)
- **Retention:** Per Supabase plan (7 days minimum)

### Recovery
- Point-in-time restore via Supabase dashboard
- Prisma migrations can rebuild schema from scratch

---

## 15. Incident Response Plan

If a security breach occurs:

1. **Isolate** affected systems (revoke compromised tokens)
2. **Investigate** via audit logs and Sentry error traces
3. **Remediate** the vulnerability
4. **Notify** affected users if personal data was exposed
5. **Document** the incident and update security controls
6. **Deploy** security patch

---

## 16. Compliance Considerations

EduChain ID aligns with:

- **GDPR principles** — data minimization, right to access, right to deletion
- **Student data protection** — privacy settings enforce access controls
- **Data processing** — only necessary data collected and stored
- **Consent** — explicit OAuth consent flow via Google

---

## 17. Security Testing

### Strategies

| Strategy | Frequency | Tool |
|---|---|---|
| Dependency auditing | Every CI run | `npm audit` |
| Automated dependency updates | Weekly | Dependabot |
| Input validation testing | Every PR | Jest + Zod schema tests |
| RBAC testing | Every PR | API integration tests |
| Penetration testing | Before major releases | Manual + OWASP ZAP |
| Credential crypto testing | Every PR | Unit tests (credential.crypto.test.ts) |

---

## 18. Security Best Practices

The platform follows these principles:

- **Least privilege access** — each role has minimal required permissions
- **Secure defaults** — all new profiles are public (not private) to encourage adoption, but sensitive data requires explicit sharing
- **Defense in depth** — multiple security layers (auth + RBAC + validation + rate limiting)
- **No secrets in code** — all secrets in environment variables
- **Managed infrastructure** — Supabase + Upstash reduce configuration surface area
- **Regular audits** — dependency scanning, access review, audit log review

---

## Final Security Model

```
Clients
   │
HTTPS / TLS 1.3
   │
Supabase Auth (Google OAuth + Email/Password)
   │
Supabase JWT
   │
Fastify API
   ├─ authenticateToken (JWT verification)
   ├─ authorizeRole (RBAC)
   ├─ validateBody (Zod schemas)
   ├─ @fastify/helmet (security headers)
   ├─ @fastify/rate-limit (throttling)
   │
Backend Modules
   │
Secure Data Layer
   ├─ Supabase PostgreSQL (encrypted at rest)
   ├─ Upstash Redis (TLS)
   ├─ Supabase Storage (signed URLs)
   │
RSA Credential Verification
   ├─ SHA-256 hashing
   ├─ RSA-2048 signatures
   └─ Audit trail
```

**Security priorities:**
1. Identity protection (Supabase Auth)
2. Credential authenticity (RSA signatures)
3. Data privacy (access controls + encryption)
4. System resilience (monitoring + incident response)
