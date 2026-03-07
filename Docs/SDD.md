# System Design Document (SDD)

**Product:** EduChain ID
**Date:** March 2026
**Status:** Active Development

---

## 1. System Overview

EduChain ID is a digital academic identity and collaboration platform that allows:

- **Students** to maintain a verified academic profile with RSA-signed credentials
- **Institutions** to issue and manage digitally signed credentials
- **Recruiters** to discover and verify candidate credentials
- **Students** to collaborate across institutions

The system ensures credential authenticity through **RSA digital signatures** — not blockchain.

---

## 2. High-Level Architecture

The architecture follows a **modular monolith** approach. All backend services run inside a single Fastify server, separated into domain modules. This allows faster development, simpler deployment, and easier debugging while maintaining clear module boundaries.

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Mobile App   │  │ Web Dashboard    │  │ Recruiter Portal │   │
│  │ (Expo 55)    │  │ (Next.js 14)     │  │ (Next.js 14)     │   │
│  │ React Native │  │ App Router       │  │ Shared codebase  │   │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬─────────┘   │
└─────────┼───────────────────┼──────────────────────┼─────────────┘
          │                   │                      │
          └─────────┬─────────┘──────────────────────┘
                    │
            ┌───────▼───────┐
            │ Supabase Auth │
            │ (Google OAuth │
            │ + Email/Pass) │
            └───────┬───────┘
                    │ Supabase JWT
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Fastify API Server                           │
│                                                                  │
│  Middleware: authenticateToken → authorizeRole → validateBody     │
│                                                                  │
│  ┌──────────┬───────────┬──────────────┬────────────────────┐    │
│  │ Auth     │ Students  │ Credentials  │ Verifications      │    │
│  │ Module   │ Module    │ Module       │ Module             │    │
│  ├──────────┼───────────┼──────────────┼────────────────────┤    │
│  │ Skills   │ Projects  │ Achievements │ Search Module      │    │
│  │ Module   │ Module    │ Module       │                    │    │
│  ├──────────┼───────────┼──────────────┼────────────────────┤    │
│  │ Collab   │ Recruiters│ Notifications│ Audit Module       │    │
│  │ Module   │ Module    │ Module       │                    │    │
│  ├──────────┼───────────┼──────────────┼────────────────────┤    │
│  │ Uploads  │ BullMQ    │ Error        │ Metrics            │    │
│  │ Module   │ Workers   │ Handler      │ Hook               │    │
│  └──────────┴───────────┴──────────────┴────────────────────┘    │
└─────────┬──────────────┬──────────────┬──────────────────────────┘
          │              │              │
          ▼              ▼              ▼
  ┌──────────────┐ ┌──────────┐ ┌──────────────┐
  │ Supabase     │ │ Upstash  │ │ Supabase     │
  │ PostgreSQL   │ │ Redis    │ │ Storage      │
  │ (Prisma ORM) │ │ (TLS)   │ │ (Files)      │
  └──────────────┘ └──────────┘ └──────────────┘
```

---

## 3. Core System Components

### 3.1 Mobile Application (Student)

**Technology:** React Native (Expo 55) with expo-router

**Responsibilities:**
- Supabase Auth (Google OAuth via expo-web-browser, email/password)
- Encrypted token storage (expo-secure-store)
- Student profile management
- Credential viewing with verification status
- Virtual Student ID card display
- Student discovery and collaboration
- Project group management

**State Management:** Zustand (auth) + TanStack Query v5 (server state)

### 3.2 Web Dashboard (Institution + Recruiter)

**Technology:** Next.js 14 with App Router

**Responsibilities:**
- Institution admin: student verification, credential issuance/revocation
- Recruiter portal: talent search, credential verification, shortlisting
- Supabase Auth (Google OAuth + email/password via AuthProvider)
- Role-based route groups: `(auth)`, `(student)`, `(institution)`, `(recruiter)`

**State Management:** TanStack Query v5 (server state) + React Context (auth)

### 3.3 API Server

**Technology:** Fastify 5.8+ with TypeScript

**Responsibilities:**
- Supabase JWT verification
- Role-based access control (RBAC)
- Business logic for all 13 domain modules
- RSA credential signing and verification
- Background job processing (BullMQ)
- Audit logging

**Key middleware chain:**
1. `authenticateToken` — verify Supabase JWT, resolve user from DB
2. `authorizeRole(roles)` — enforce RBAC
3. `validateBody(schema)` — Zod input validation
4. `errorHandler` — standardized error responses + Sentry capture

### 3.4 Credential Verification Service

Embedded within the credentials module. Ensures credential authenticity using RSA digital signatures.

**Crypto operations (lib/credential.crypto.ts):**
- `generateInstitutionKeyPair()` — RSA-2048 PEM key pair
- `generateCredentialHash(payload)` — SHA-256 hex hash
- `signCredential(hash, privateKey)` — RSA-SHA256 base64 signature
- `verifyCredentialSignature(hash, signature, publicKey)` — boolean

### 3.5 Database

**Provider:** Supabase PostgreSQL
**ORM:** Prisma 5 with type-safe queries

**Stores:** users, students, institutions, credentials, collaborations, projects, achievements, audit logs, notifications, recruiter data

### 3.6 Cache Layer

**Provider:** Upstash Redis (TLS via ioredis)

**Used for:**
- Search result caching (5-minute TTL)
- BullMQ job queue backend
- Rate limiting support

### 3.7 File Storage

**Provider:** Supabase Storage

**Used for:**
- Certificate files
- Profile avatars
- Supporting documents

**Security:** Private bucket with signed URLs (time-limited access)

---

## 4. Data Flow Diagrams

### Flow 1: Student Registration (Email/Password)

```
Student App
    │
    ├─ supabase.auth.signUp({ email, password })
    │
    ▼
Supabase Auth creates identity
    │
    ▼
Client calls POST /api/v1/auth/register
    │
    ▼
API Server:
    ├─ Validate input (Zod)
    ├─ Hash password (Argon2)
    ├─ Create User record (role: 'student')
    ├─ Create Student profile
    ├─ Generate refresh token
    │
    ▼
Return: { user, tokens }
```

### Flow 2: Google OAuth Login

```
Client App
    │
    ├─ supabase.auth.signInWithOAuth({ provider: 'google' })
    │
    ▼
Supabase redirects to Google → user consents → returns to callback
    │
    ▼
Supabase issues JWT (access_token in session)
    │
    ▼
Client calls POST /api/v1/auth/sync (with Supabase JWT)
    │
    ▼
API Server:
    ├─ authenticateToken verifies Supabase JWT
    ├─ Extracts email from token
    ├─ Find or create User record
    ├─ Return user profile with role
    │
    ▼
Client routes to role-appropriate dashboard
```

### Flow 3: Institution Issues Credential

```
Institution Dashboard
    │
    ├─ POST /api/v1/credentials/issue (with Supabase JWT)
    │
    ▼
API Server:
    ├─ authenticateToken (verify JWT)
    ├─ authorizeRole(['institution_admin'])
    ├─ validateBody(issueCredentialSchema)
    ├─ Create credential record (status: active)
    ├─ Enqueue BullMQ job: 'credential.sign'
    │
    ▼
BullMQ Worker (async):
    ├─ Fetch institution private key
    ├─ Generate credential JSON
    ├─ SHA-256 hash (deterministic serialization)
    ├─ RSA-SHA256 sign(hash, privateKey)
    ├─ Update credential: set credential_hash + signature
    ├─ Write audit log
    ├─ Send notification to student
    │
    ▼
Credential appears in student profile with verification badge
```

### Flow 4: Credential Verification (Public)

```
Recruiter / Public User
    │
    ├─ GET /api/v1/credentials/verify/:id (no auth required)
    │
    ▼
API Server:
    ├─ Retrieve credential record
    ├─ Retrieve institution public key
    ├─ Recompute SHA-256 hash from credential data
    ├─ crypto.createVerify('RSA-SHA256').verify(publicKey, signature)
    │
    ▼
Return: { valid: true/false, credential, institution, status }
```

### Flow 5: Student Search

```
Recruiter / Student
    │
    ├─ GET /api/v1/search/students?skill=react&institution=xyz
    │
    ▼
API Server:
    ├─ authenticateToken
    ├─ Check Redis cache for query
    ├─ If cached → return cached results
    ├─ If not cached:
    │   ├─ PostgreSQL full-text search (GIN index)
    │   ├─ Apply privacy filters (exclude private profiles)
    │   ├─ Apply role-based result filtering
    │   ├─ Cursor-based pagination
    │   ├─ Store in Redis cache (5-min TTL)
    │
    ▼
Return: { students[], cursor, total }
```

### Flow 6: Collaboration Request

```
Student A
    │
    ├─ POST /api/v1/collaboration/request
    │
    ▼
API Server:
    ├─ authenticateToken
    ├─ Create CollaborationRequest record (status: pending)
    ├─ Enqueue BullMQ notification job
    │
    ▼
Student B receives in-app notification
    │
    ├─ POST /api/v1/collaboration/accept
    │
    ▼
API Server:
    ├─ Update request status to 'accepted'
    ├─ Notify Student A
```

---

## 5. Database ER Model

### Entity Relationships

```
User
 │
 ├── Student (1:1)
 │     ├── Skills (M:N via StudentSkill)
 │     ├── Projects (1:N)
 │     ├── Achievements (1:N)
 │     ├── Credentials (1:N)
 │     ├── StudentVerifications (1:N)
 │     ├── Follows (M:N via Follow)
 │     ├── CollaborationRequests (1:N as sender/receiver)
 │     ├── Groups (1:N as creator)
 │     ├── GroupMemberships (M:N via GroupMember)
 │     ├── ActivityLogs (1:N)
 │     └── Shortlists (M:N via Shortlist)
 │
 ├── Recruiter (1:1)
 │     └── Shortlists (1:N)
 │
 └── Notifications (1:N)

Institution
 ├── Students (1:N)
 ├── StudentVerifications (1:N)
 └── Credentials (1:N)

Group
 └── GroupMembers (1:N)
```

---

## 6. Credential Verification Design

### Credential JSON Structure

```json
{
  "credential_id": "uuid",
  "student_id": "uuid",
  "institution_id": "uuid",
  "credential_type": "Degree",
  "title": "Bachelor of Computer Science",
  "description": "Completed 4-year program",
  "issued_date": "2026-03-06"
}
```

### Hashing

```
canonical = JSON.stringify(payload, Object.keys(payload).sort())
hash = crypto.createHash('sha256').update(canonical).digest('hex')
```

### Signing

```
signer = crypto.createSign('RSA-SHA256')
signer.update(hash)
signature = signer.sign(privateKeyPem, 'base64')
```

### Verification

```
verifier = crypto.createVerify('RSA-SHA256')
verifier.update(recomputedHash)
valid = verifier.verify(publicKeyPem, signature, 'base64')
```

### Revocation

Setting `credential.status = 'revoked'` flags the credential. The verification endpoint checks both the signature validity AND the status field.

---

## 7. API Interaction Model

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Description of the error"
}
```

### Example: Issue Credential

**Request:**
```
POST /api/v1/credentials/issue
Authorization: Bearer <supabase-jwt>

{
  "student_id": "uuid",
  "credential_type": "Course Completion",
  "title": "Machine Learning Certification",
  "description": "Completed advanced ML course",
  "issued_date": "2026-03-06"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",
    "credential_type": "Course Completion",
    "title": "Machine Learning Certification"
  }
}
```

---

## 8. Scalability Design

### Horizontal Scaling

Backend servers are stateless. Multiple instances can run behind a load balancer.

```
Client
   │
Load Balancer
   │
┌──────┬──────┬──────┐
│ API  │ API  │ API  │
│  #1  │  #2  │  #3  │
└──┬───┴──┬───┴──┬───┘
   │      │      │
   └──────┼──────┘
          │
  Supabase PostgreSQL
  (connection pooling via PgBouncer)
```

### Database Scaling

- **Indexing:** GIN indexes for full-text search, B-tree for lookups
- **Connection pooling:** Supabase PgBouncer manages connection limits
- **Read replicas:** Add when recruiter search traffic grows
- **Partitioning:** Credentials table if exceeding 10M rows

### Caching

- Redis (Upstash) for search results (5-minute TTL)
- TanStack Query on frontend (stale-while-revalidate pattern)
- Cache invalidation on data mutation

### Async Processing

BullMQ processes:
- Credential signing (non-blocking issuance)
- Email notification delivery (via Resend)
- Activity logging

---

## 9. Security Design

### Authentication Security

| Layer | Mechanism |
|---|---|
| Identity Provider | Supabase Auth (Google OAuth + email/password) |
| Token Format | Supabase JWT (verified with SUPABASE_JWT_SECRET) |
| Password Hashing | Argon2 (for local accounts) |
| Mobile Token Storage | expo-secure-store (encrypted) |
| Role Resolution | From application DB (users.role), not JWT claims |

### Data Protection

| Data | Protection |
|---|---|
| Passwords | Argon2 hash (never stored plaintext) |
| RSA Private Keys | Stored via reference (not in main DB) |
| Tokens | Supabase manages lifecycle; mobile uses encrypted storage |
| Files | Supabase Storage with signed URLs (time-limited) |
| Database | Supabase managed encryption at rest, TLS in transit |
| Redis | Upstash with TLS (rediss:// protocol) |

### API Security

- @fastify/helmet security headers
- @fastify/rate-limit (300/min global)
- Zod schema validation on every endpoint
- CORS strict origin allowlist in production
- 10 KB body size limit
- Sentry error capture (no stack traces in responses)

### Access Control (RBAC)

```
student:           Own profile, view public profiles, collaborate, search
institution_admin: Verify students, issue/revoke credentials
recruiter:         Browse public/recruiter_only profiles, shortlist
platform_admin:    Full system access
```

---

## 10. Deployment Architecture

| Component | Platform |
|---|---|
| Web (Next.js) | Vercel (auto-deploy on push) |
| API (Fastify) | Railway / Fly.io (Docker container) |
| Mobile (Expo) | EAS Build → App Store / Google Play |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Cache/Queue | Upstash Redis |
| Monitoring | Sentry |
| CI/CD | GitHub Actions |

### Infrastructure Flow

```
Users
   │
Vercel CDN (Web)  /  App Stores (Mobile)
   │
API (Railway/Fly.io Docker)
   │
┌──────────────┬──────────────┬──────────────┐
│ Supabase     │ Upstash      │ Supabase     │
│ PostgreSQL   │ Redis        │ Storage      │
└──────────────┴──────────────┴──────────────┘
   │
Sentry (Error Tracking)
```

---

## 11. Observability

### Logging
- **Pino** structured JSON logger (built into Fastify)
- Request ID propagation via `x-request-id` header
- Log levels: info, warn, error

### Error Tracking
- **Sentry** SDK in API, web, and mobile
- Captures unhandled exceptions with context (userId, endpoint)
- Source maps for web + mobile builds

### Metrics
- Lightweight in-process counters (`lib/metrics.ts`)
- Tracks: total requests, error count, latency
- Exposed via `GET /metrics` endpoint

### Health Check
- `GET /api/v1/health` → `{ status: 'OK', uptime, version }`
- Used by deployment platforms for readiness/liveness probes

---

## 12. Failure Handling

### Database Failure
- Supabase provides managed failover
- Prisma retry logic with exponential backoff
- Read-only degraded mode if primary is unavailable

### Redis (Upstash) Failure
- Cache-aside pattern: app continues without cache (slower performance)
- BullMQ jobs retry with backoff

### Credential Verification Failure
- Return `{ valid: false, error: 'verification_failed' }`
- Log to audit trail for investigation
- Prompt user to contact institution

### Auth Provider (Supabase) Outage
- Graceful error messages to users
- Email/password login as fallback if OAuth is down
- Session tokens remain valid until expiry

---

## 13. Future Architecture Expansion

When scaling beyond current capacity:

1. **Extract microservices** from high-traffic modules (search, credentials)
2. **Add read replicas** for search-heavy recruiter queries
3. **Migrate to AWS infrastructure** using existing Terraform modules
4. **Add Elasticsearch** for advanced search features
5. **Implement WebSocket** for real-time notifications
6. **Add OTA updates** via Expo for JS-only mobile changes

### Final Architecture Summary

```
Mobile App (Expo)  /  Web Apps (Next.js)
          │
       Supabase Auth
          │
    Fastify API (Modular Monolith)
          │
Supabase PostgreSQL + Upstash Redis + Supabase Storage
          │
   RSA Credential Verification Layer
```

**Design goals:** Simple. Secure. Scalable. Maintainable.
