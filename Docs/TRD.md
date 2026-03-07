# Technical Requirement Document (TRD)

**Product:** EduChain ID
**Date:** March 2026
**Status:** Active Development

---

## 1. System Architecture Overview

EduChain ID follows a **modular monolith** architecture with a centralized Fastify API backend and an RSA-based credential verification layer. All services run inside a single deployable Node.js backend, separated into domain modules.

### Architecture Diagram

```
Mobile App (Expo)  /  Web Dashboard (Next.js)
        │                    │
        └────────┬───────────┘
                 │
          Supabase Auth
        (Google OAuth + Email)
                 │
              Supabase JWT
                 │
         ┌───────────────────────────────────────────┐
         │              Fastify API Server            │
         │                                            │
         │  ┌──────────┬───────────┬──────────────┐   │
         │  │ Auth     │ Students  │ Credentials  │   │
         │  │ Module   │ Module    │ Module       │   │
         │  ├──────────┼───────────┼──────────────┤   │
         │  │ Search   │ Collab    │ Recruiters   │   │
         │  │ Module   │ Module    │ Module       │   │
         │  ├──────────┼───────────┼──────────────┤   │
         │  │ Verify   │ Uploads   │ Notifications│   │
         │  │ Module   │ Module    │ Module       │   │
         │  └──────────┴───────────┴──────────────┘   │
         │              │                │             │
         │    ┌─────────┘                └──────┐      │
         │    ▼                                 ▼      │
         │  BullMQ Worker              Audit Module    │
         └───────┬──────────────┬──────────────────────┘
                 │              │
    ┌────────────┼──────────────┼────────────┐
    │            │              │            │
    ▼            ▼              ▼            ▼
Supabase     Upstash       Supabase      Sentry
PostgreSQL   Redis         Storage       Error
(Prisma)     (Cache/Queue) (Files)       Tracking
```

### Core Components

| Component | Technology | Purpose |
|---|---|---|
| Mobile App | React Native (Expo 55) | Student identity & portfolio |
| Web Dashboard | Next.js 14 (App Router) | Institution admin & recruiter portal |
| API Server | Fastify 5 + TypeScript | RESTful backend with domain modules |
| Auth Provider | Supabase Auth | Google OAuth + email/password authentication |
| Database | Supabase PostgreSQL | Primary relational data store |
| ORM | Prisma 5 | Type-safe database access and migrations |
| Cache | Upstash Redis (TLS) | Application caching and job queue backend |
| Queue | BullMQ | Async credential signing and notifications |
| Storage | Supabase Storage | File uploads (certificates, avatars) |
| Email | Resend | Transactional email delivery |
| Monitoring | Sentry | Error tracking and performance monitoring |
| Monorepo | Turborepo 2 | Build orchestration across all packages |

---

## 2. Frontend Responsibilities

### Student App (React Native / Expo)

**Authentication:**
- Google OAuth via Supabase Auth (expo-web-browser + expo-auth-session)
- Encrypted token storage (expo-secure-store)
- Automatic session refresh via Supabase client

**Profile Management:**
- Display and edit student profile (bio, degree, graduation year)
- Manage skills, projects, and achievements
- Privacy settings (public / recruiter_only / private)

**Social Features:**
- Follow/unfollow students
- Send and manage collaboration requests
- Create and manage project groups

**Search & Discovery:**
- Search students by skill, institution, graduation year
- View verified student profiles
- Skills autocomplete

**Credential Viewing:**
- Display issued credentials with verification status
- RSA-verified credential badges
- Virtual Student ID card

### Institution Dashboard (Next.js)

Institution admins can:
- View and manage linked students
- Process student verification requests (approve/reject)
- Issue RSA-signed academic credentials
- Revoke credentials
- View credential issuance history
- Manage institution settings

### Recruiter Portal (Next.js — shared codebase)

Recruiters can:
- Browse and search student profiles (respects privacy settings)
- Verify student credentials via RSA public key verification
- Shortlist candidates with optional notes
- Manage shortlisted students

---

## 3. Backend Responsibilities

The backend is the source of truth for all business logic. It runs as a Fastify server with 13 domain modules.

### Auth Module
- Verifies Supabase JWTs via `SUPABASE_JWT_SECRET`
- Bridges OAuth users to application DB via `POST /api/v1/auth/sync`
- Manages local registration and login (Argon2 password hashing)
- Issues and validates refresh tokens
- Role-based access control (RBAC) via middleware

**Roles:** `student`, `institution_admin`, `recruiter`, `platform_admin`

### Student Profile Module
- Student profile CRUD with privacy controls
- Skill management (add/remove from catalog)
- Project and achievement CRUD
- Profile visibility enforcement at query level

### Credential Module
- RSA-2048 key pair generation per institution
- SHA-256 credential hash generation (deterministic JSON serialization)
- RSA-SHA256 digital signature creation
- Public credential verification endpoint
- Credential revocation with audit trail
- Async signing via BullMQ worker

### Institution/Verification Module
- Student verification request workflow
- Institution onboarding with RSA key generation
- Verification approval/rejection by institution admin

### Collaboration Module
- Follow/unfollow system
- Collaboration request workflow (send → accept/reject)
- Project group management

### Search Module
- PostgreSQL full-text search with GIN indexes (pg_trgm)
- Redis-cached search results (5-minute TTL)
- Cursor-based pagination
- Privacy-aware result filtering

### Recruiter Module
- Talent browse with filters
- Shortlist management
- Privacy-respecting profile access

### Notification Module
- In-app notifications (stored in DB)
- Email notifications via Resend + BullMQ
- Triggered by credential issuance, collaboration events, verification status changes

### Upload Module
- Supabase Storage file uploads
- Signed URL generation for secure access
- File type validation and size limits

### Audit Module
- Immutable audit trail for sensitive operations
- Tracks actor, role, action, entity, metadata, timestamp

---

## 4. Database Schema

**Primary Database:** Supabase PostgreSQL
**ORM:** Prisma 5

### Core Tables

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | id, email, password_hash, role | User accounts with roles |
| `refresh_tokens` | id, token, user_id, expires_at | JWT refresh token storage |
| `institutions` | id, name, domain, public_key, private_key_ref | Institution records with RSA keys |
| `students` | id, user_id, full_name, institution_id, degree, graduation_year, bio, profile_visibility | Student profiles |
| `skills` | id, name | Skill catalog |
| `student_skills` | student_id, skill_id | Student-skill associations |
| `projects` | id, student_id, title, description, repo_link | Portfolio projects |
| `achievements` | id, student_id, title, description, issued_by, date | Academic achievements |
| `student_verifications` | id, student_id, institution_id, status | Verification requests |
| `credentials` | id, student_id, institution_id, credential_hash, signature, status | RSA-signed credentials |
| `audit_logs` | id, actor_id, actor_role, action, entity_type, entity_id, metadata | Audit trail |
| `follows` | follower_id, following_id | Social follow relationships |
| `collaboration_requests` | id, sender_id, receiver_id, status, message | Collaboration workflow |
| `groups` | id, name, description, created_by | Project groups |
| `group_members` | group_id, student_id, role | Group membership |
| `notifications` | id, user_id, type, title, body, read | In-app notifications |
| `activity_logs` | id, actor_id, action, target_id, metadata | Activity feed |
| `recruiters` | id, user_id, company_name, position, bio | Recruiter profiles |
| `shortlists` | recruiter_id, student_id, note | Recruiter shortlists |

---

## 5. API Structure

**Style:** REST API
**Base URL:** `/api/v1`
**Framework:** Fastify 5

### Auth APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create user account |
| POST | `/auth/login` | No | Login with email/password |
| POST | `/auth/sync` | Yes | Bridge Supabase OAuth user to app DB |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Invalidate refresh token |

### Student APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/students/me` | Yes | Current student profile |
| PUT | `/students/me` | Yes | Update profile |
| GET | `/students/:id` | Yes | Get student by ID |

### Skills APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/skills` | Yes | List skill catalog |
| POST | `/students/me/skills` | Yes | Add skill to profile |
| DELETE | `/students/me/skills/:id` | Yes | Remove skill |

### Project APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/projects` | Yes | Create project |
| GET | `/projects/:student_id` | Yes | Get student projects |
| PUT | `/projects/:id` | Yes | Update project |
| DELETE | `/projects/:id` | Yes | Delete project |

### Achievement APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/achievements` | Yes | Create achievement |
| GET | `/achievements/:student_id` | Yes | Get student achievements |
| PUT | `/achievements/:id` | Yes | Update achievement |
| DELETE | `/achievements/:id` | Yes | Delete achievement |

### Credential APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/credentials/issue` | Yes (institution_admin) | Issue credential |
| GET | `/credentials/:student_id` | Yes | Get student credentials |
| GET | `/credentials/verify/:id` | No | Public verification endpoint |
| POST | `/credentials/revoke` | Yes (institution_admin) | Revoke credential |

### Verification APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/verifications/request` | Yes (student) | Submit verification request |
| GET | `/verifications/pending` | Yes (institution_admin) | List pending requests |
| POST | `/verifications/:id/approve` | Yes (institution_admin) | Approve request |
| POST | `/verifications/:id/reject` | Yes (institution_admin) | Reject request |

### Collaboration APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/follow/:studentId` | Yes | Follow a student |
| DELETE | `/follow/:studentId` | Yes | Unfollow |
| POST | `/collaboration/request` | Yes | Send collaboration request |
| POST | `/collaboration/accept` | Yes | Accept request |
| POST | `/collaboration/reject` | Yes | Reject request |
| GET | `/collaboration/list` | Yes | List requests |
| POST | `/groups` | Yes | Create project group |
| GET | `/groups` | Yes | List groups |
| POST | `/groups/:id/members` | Yes | Add group member |

### Search APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/search/students` | Yes | Full-text student search |
| GET | `/search/skills` | Yes | Skills autocomplete |

### Recruiter APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/recruiters/students` | Yes (recruiter) | Browse students |
| GET | `/recruiters/profile/:id` | Yes (recruiter) | View student profile |
| POST | `/recruiters/shortlist` | Yes (recruiter) | Add to shortlist |
| GET | `/recruiters/shortlist` | Yes (recruiter) | List shortlisted |
| DELETE | `/recruiters/shortlist/:id` | Yes (recruiter) | Remove from shortlist |

### Notification APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | List notifications |
| PUT | `/notifications/:id` | Yes | Mark as read |

### Upload APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/uploads/certificate` | Yes | Upload certificate file |
| POST | `/uploads/avatar` | Yes | Upload profile avatar |

### System APIs
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| GET | `/metrics` | No | Internal metrics |

---

## 6. Authentication Strategy

### Supabase Auth + Google OAuth

Authentication is fully managed by **Supabase Auth**. The API does not issue its own identity tokens — it verifies Supabase JWTs.

### Token Flow

```
Client App
    │
    ├─ supabase.auth.signInWithOAuth({ provider: 'google' })
    │  OR
    ├─ supabase.auth.signInWithPassword({ email, password })
    │
    ▼
Supabase Auth
    │
    ├─ Handles OAuth redirect + code exchange
    ├─ Issues JWT (access_token + refresh_token)
    │
    ▼
Client receives Supabase Session
    │
    ├─ Sends access_token as Bearer token to API
    │
    ▼
Fastify API
    │
    ├─ authenticateToken middleware:
    │   1. Extract Bearer token
    │   2. jwt.verify(token, SUPABASE_JWT_SECRET)
    │   3. Extract email from decoded payload
    │   4. prisma.user.findUnique({ where: { email } })
    │   5. Attach { userId, email, role } to request.user
    │
    ├─ authorizeRole middleware:
    │   - Check request.user.role against allowed roles
    │
    ▼
Business Logic (domain modules)
```

### Token Storage

| Platform | Storage Method |
|---|---|
| Mobile (Expo) | expo-secure-store (encrypted) |
| Web (Next.js) | Supabase client (in-memory + localStorage) |
| API | Stateless — verifies each request independently |

### OAuth Bridge (Sync Endpoint)

After Google OAuth, the client calls `POST /api/v1/auth/sync` to ensure the OAuth user exists in the application database. This endpoint:

1. Requires a valid Supabase JWT
2. Extracts the user's email from the token
3. Finds or creates a user record in the DB
4. Returns the user's application profile and role

---

## 7. Credential Verification Layer

EduChain uses **RSA digital signatures** for tamper-proof credential verification.

### Credential Workflow

```
Institution Issues Credential
        │
        ▼
Generate Credential JSON
        │
        ▼
SHA-256 Hash (deterministic serialization, sorted keys)
        │
        ▼
RSA-SHA256 Sign(hash, institution_private_key)
        │
        ▼
Store: credential_hash + signature in credentials table
```

### Verification Process

```
Recruiter / Public views credential
        │
        ▼
Retrieve credential record + institution public key
        │
        ▼
Recompute SHA-256 hash from credential data
        │
        ▼
crypto.createVerify('RSA-SHA256').verify(publicKey, signature)
        │
        ▼
Return: { valid: true/false, status: active/revoked }
```

### Key Management

| Key | Storage |
|---|---|
| RSA Public Key | `institutions.public_key` column (PEM format) |
| RSA Private Key | Referenced via `institutions.private_key_ref` (env/secrets) |
| Key Algorithm | RSA-2048 |
| Hash Algorithm | SHA-256 |
| Signature Algorithm | RSA-SHA256 |

---

## 8. Third-Party Dependencies

### Production Dependencies

| Dependency | Purpose |
|---|---|
| Supabase Auth | Identity provider (OAuth + email/password) |
| Supabase PostgreSQL | Primary database (managed) |
| Supabase Storage | File storage with signed URLs |
| Upstash Redis | Cache + BullMQ backend (TLS) |
| Resend | Transactional email delivery |
| Sentry | Error tracking and performance monitoring |
| Google Cloud OAuth | OAuth identity provider via Supabase |

### Key npm Packages

| Package | Version | Purpose |
|---|---|---|
| fastify | 5.8.x | HTTP framework |
| @prisma/client | 5.12+ | Database ORM |
| @supabase/supabase-js | 2.98+ | Supabase client (web + mobile) |
| jsonwebtoken | 9.x | JWT verification |
| argon2 | 0.40.x | Password hashing |
| bullmq | 5.70+ | Background job queue |
| ioredis | 5.9+ | Redis client |
| zod | 3.22+ | Runtime schema validation |
| resend | 6.9+ | Email delivery |
| @sentry/node | 10.x | Error tracking |

---

## 9. Scalability Considerations

### Horizontal Scaling
- Backend is stateless — can run multiple instances behind a load balancer
- Supabase handles database connection pooling (PgBouncer)
- Redis (Upstash) scales independently

### Database Optimization
- GIN indexes on `students.full_name` and `skills.name` (pg_trgm)
- Composite indexes on frequently queried columns
- Cursor-based pagination for search endpoints

### Async Processing
- BullMQ for credential signing (non-blocking issuance)
- BullMQ for email notification delivery
- ioredis connection shared between cache and queue

### Caching
- Redis-backed search result caching (5-minute TTL)
- TanStack Query on frontend (stale-while-revalidate)

### Rate Limiting
- Global: 300 requests/minute per IP (@fastify/rate-limit)
- Per-route limits configurable for sensitive endpoints

---

## 10. Security Considerations

### Data Privacy
- Student profiles support three visibility levels: public, recruiter_only, private
- Privacy enforced at the database query level
- Role-based result filtering in search endpoints

### API Security
- @fastify/helmet for security headers
- Zod input validation on every endpoint
- Rate limiting at framework level
- CORS strict origin allowlist in production
- 10 KB body size limit (configurable per route)

### Credential Integrity
- RSA-2048 digital signatures (computationally infeasible to forge)
- SHA-256 hashing with deterministic serialization
- Audit trail for all credential operations

### Authentication Security
- Supabase JWT verification (no custom token issuance for identity)
- Encrypted token storage on mobile (expo-secure-store)
- Roles stored in application DB, not in JWT claims

---

## 11. Deployment Architecture

### Current Stack

| Component | Platform |
|---|---|
| Web (Next.js) | Vercel |
| API (Fastify) | Railway / Fly.io (Docker) |
| Mobile (Expo) | EAS Build → App Store / Google Play |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Cache | Upstash Redis |
| CI/CD | GitHub Actions |

### AWS Infrastructure (Production Scaling)

Terraform modules exist in `infrastructure/terraform/` for production-scale deployment:

| Module | Resource |
|---|---|
| `vpc` | VPC with public + private subnets |
| `alb` | Application Load Balancer with HTTPS |
| `ecs` | ECS Fargate for API containers |
| `rds` | PostgreSQL (for future Supabase migration) |
| `redis` | ElastiCache Redis cluster |
| `s3` | Private S3 bucket with signed URLs |
| `secrets` | AWS Secrets Manager |
| `ecr` | Container registry |

---

## 12. Long-Term Stability Principles

Design decisions prioritize:

- **Simple architecture** — modular monolith over microservices
- **Clear data ownership** — each module owns its Prisma models
- **Stateless backend** — enables horizontal scaling
- **Type safety** — TypeScript + Prisma + Zod across the entire stack
- **Shared contracts** — @educhain/types and @educhain/validators prevent drift
- **Managed infrastructure** — Supabase + Upstash reduce operational overhead

Avoid:

- Microservice explosion
- Complex custom auth systems (use Supabase)
- Blockchain verification (use RSA signatures)
- Unnecessary AI/ML features
