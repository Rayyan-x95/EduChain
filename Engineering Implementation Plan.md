# EduChain ID — Engineering Implementation Plan

**Product:** EduChain ID
**Date:** June 2025
**Status:** Active Development
**Team Size Assumption:** 3–5 developers

---

## Table of Contents

1. [System Architecture Summary](#1-system-architecture-summary)
2. [Technology Stack](#2-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Development Phases](#4-development-phases)
5. [Backend Implementation Plan](#5-backend-implementation-plan)
6. [Frontend Implementation Plan](#6-frontend-implementation-plan)
7. [Database Implementation Plan](#7-database-implementation-plan)
8. [DevOps & Deployment Plan](#8-devops--deployment-plan)
9. [Testing Implementation Plan](#9-testing-implementation-plan)
10. [Security Architecture](#10-security-architecture)
11. [Performance & Scaling Strategy](#11-performance--scaling-strategy)
12. [Risk Analysis & Mitigations](#12-risk-analysis--mitigations)

---

## 1. System Architecture Summary

EduChain ID is a **monorepo-based** platform for verifying academic credentials using **RSA digital signatures** (not blockchain). The system connects students, educational institutions, and recruiters through a unified credential workflow.

### Core Components

| Layer | Component | Technology |
|---|---|---|
| **Web App** | Institution dashboard, Recruiter portal, Student web | Next.js 14 (App Router) |
| **Mobile App** | Student identity & portfolio | React Native (Expo 55) + expo-router |
| **API** | RESTful backend | Fastify 5 + TypeScript |
| **Auth** | Identity & OAuth | Supabase Auth + Google OAuth |
| **Database** | Relational store | Supabase PostgreSQL via Prisma 5 |
| **Cache** | Application cache & queue backend | Upstash Redis (TLS) via ioredis |
| **Queue** | Background job processing | BullMQ |
| **Storage** | File uploads (certificates, avatars) | Supabase Storage |
| **Email** | Transactional notifications | Resend |
| **Monitoring** | Error tracking & observability | Sentry + lightweight in-process metrics |
| **Monorepo** | Build orchestration | Turborepo 2 |

### Backend Modules

| Module | Purpose |
|---|---|
| `auth` | Registration, login, Supabase JWT sync, refresh tokens |
| `students` | Student profile CRUD, privacy controls |
| `skills` | Skill catalog and student-skill associations |
| `projects` | Student portfolio projects |
| `achievements` | Academic and extracurricular achievements |
| `verifications` | Institution-student verification requests |
| `credentials` | RSA-signed credential issuance, verification, revocation |
| `audit` | Immutable audit trail for all sensitive operations |
| `uploads` | Supabase Storage file upload (signed URLs) |
| `search` | Full-text search with PostgreSQL GIN indexes + Redis caching |
| `collaboration` | Follow system, collaboration requests, project groups |
| `notifications` | In-app and email notifications via BullMQ |
| `recruiters` | Talent discovery, shortlisting, profile access |

### Shared Packages

| Package | Purpose |
|---|---|
| `@educhain/types` | Shared TypeScript interfaces and type definitions |
| `@educhain/validators` | Zod schemas for input validation (shared between API & frontend) |
| `@educhain/auth` | Supabase client factories (`createSupabaseBrowserClient`, `createSupabaseServerClient`) |
| `@educhain/ui` | Shared React component library |

### Authentication Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Supabase Auth                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Email/Pass   │  │ Google OAuth │  │ Session Mgmt     │   │
│  │ signUp()     │  │ signInWith   │  │ onAuthStateChange│   │
│  │ signInWith   │  │ OAuth()      │  │ getSession()     │   │
│  │ Password()   │  │              │  │ signOut()        │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────┬───────────────────────────────────┘
                           │ Supabase JWT
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    Fastify API                               │
│                                                              │
│  authenticateToken middleware:                                │
│    1. Extract Bearer token from Authorization header         │
│    2. jwt.verify(token, SUPABASE_JWT_SECRET)                 │
│    3. Extract email from decoded payload                     │
│    4. prisma.user.findUnique({ where: { email } })           │
│    5. Attach { userId, email, role } to request.user         │
│                                                              │
│  authorizeRole middleware:                                    │
│    - Check request.user.role against allowed roles           │
└──────────────────────────────────────────────────────────────┘
```

### Credential Verification Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              RSA Digital Signature Flow                       │
│                                                              │
│  Institution Onboarding:                                     │
│    1. crypto.generateKeyPairSync('rsa', 2048)                │
│    2. Store publicKey in institutions table                   │
│    3. Store privateKeyRef (encrypted/env-managed)            │
│                                                              │
│  Credential Issuance (BullMQ async job):                     │
│    1. Serialize credential payload (sorted keys)             │
│    2. SHA-256 hash → credentialHash                          │
│    3. RSA-SHA256 sign(hash, privateKey) → signature          │
│    4. Store hash + signature in credentials table            │
│                                                              │
│  Credential Verification (public endpoint):                  │
│    1. Retrieve credential + institution public key           │
│    2. Recompute SHA-256 hash from stored payload             │
│    3. crypto.createVerify('RSA-SHA256').verify(pubKey, sig)  │
│    4. Return { valid: true/false, status, credential }       │
└──────────────────────────────────────────────────────────────┘
```

### User Roles

| Role | Access |
|---|---|
| `student` | Own profile, credentials, collaboration, discovery |
| `institution_admin` | Verify students, issue/revoke credentials, manage institution |
| `recruiter` | Search students, view verified profiles, shortlist |
| `platform_admin` | Full system administration |

---

## 2. Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Fastify** | 5.8.x | HTTP framework (async, schema-first, high throughput) |
| **TypeScript** | 5.4+ | Type safety across the entire stack |
| **Prisma** | 5.12+ | Database ORM with type-safe queries and migrations |
| **Supabase Auth** | — | Authentication provider (email/password + Google OAuth) |
| **jsonwebtoken** | 9.x | Supabase JWT verification on the API side |
| **Argon2** | 0.40.x | Password hashing (for local accounts) |
| **BullMQ** | 5.70+ | Background job queue (credential signing, notifications) |
| **ioredis** | 5.9+ | Redis client (connects to Upstash Redis with TLS) |
| **Zod** | 3.22+ | Runtime schema validation |
| **Pino** | 8.19+ | Structured JSON logging |
| **Resend** | 6.9+ | Transactional email delivery |
| **Sentry** | 10.x | Error tracking and performance monitoring |

### Frontend — Web (Next.js)

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.2.x | React framework with App Router and SSR |
| **React** | 18.3.x | UI library |
| **TanStack Query** | 5.x | Server state management, caching, synchronization |
| **Tailwind CSS** | 3.4.x | Utility-first styling |
| **Supabase JS** | 2.98+ | Client-side auth (Google OAuth, session management) |
| **Lucide React** | 0.577+ | Icon library |
| **clsx + tailwind-merge** | — | Conditional class composition |

### Frontend — Mobile (React Native / Expo)

| Technology | Version | Purpose |
|---|---|---|
| **Expo** | 55.x | React Native development platform |
| **React Native** | 0.84.x | Cross-platform mobile framework |
| **expo-router** | 55.x | File-based navigation |
| **Zustand** | 5.x | Lightweight state management |
| **TanStack Query** | 5.x | Server state management |
| **Supabase JS** | 2.98+ | Client-side auth with SecureStore adapter |
| **expo-secure-store** | 55.x | Encrypted key-value storage for tokens |
| **expo-web-browser** | 55.x | OAuth redirect handling |

### Infrastructure & DevOps

| Technology | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, Auth, Storage (single managed platform) |
| **Upstash Redis** | Serverless Redis with TLS (caching + BullMQ backend) |
| **Vercel** | Web app deployment (Next.js optimized) |
| **Railway / Fly.io** | API deployment (Docker container) |
| **GitHub Actions** | CI/CD pipelines |
| **Turborepo** | Monorepo build orchestration with caching |
| **Docker** | Local development and API production builds |
| **Sentry** | Error tracking across API, web, and mobile |

### Shared Packages

| Package | Contents |
|---|---|
| `@educhain/types` | `TokenPayload`, `UserRole`, API response types, entity interfaces |
| `@educhain/validators` | Zod schemas: `registerSchema`, `loginSchema`, `credentialSchema`, etc. |
| `@educhain/auth` | `createSupabaseBrowserClient()`, `createSupabaseServerClient()` |
| `@educhain/ui` | Shared React components (future expansion) |

---

## 3. Repository Structure

```
educhain-id/                         # Turborepo monorepo root
├── turbo.json                       # Turborepo pipeline configuration
├── package.json                     # Root workspace definition
├── tsconfig.base.json               # Shared TypeScript config
├── docker-compose.yml               # Production Docker setup
├── docker-compose.dev.yml           # Local development stack
├── Dockerfile                       # Multi-stage API build
├── .env.example                     # Environment variable template
│
├── apps/
│   ├── api/                         # Fastify API server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── jest.config.cjs
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Full Prisma schema (20+ models)
│   │   │   └── migrations/          # Ordered Prisma migrations
│   │   └── src/
│   │       ├── server.ts            # Entry point: Prisma connect → build app → listen
│   │       ├── app.ts               # Fastify instance, plugins, route registration
│   │       ├── config/
│   │       │   └── env.ts           # Zod-validated environment variables
│   │       ├── lib/
│   │       │   ├── prisma.ts        # Prisma client singleton
│   │       │   ├── cache.ts         # Redis cache helpers (ioredis → Upstash)
│   │       │   ├── credential.crypto.ts  # RSA key gen, hash, sign, verify
│   │       │   ├── jwt.ts           # App-level JWT helpers (refresh tokens)
│   │       │   ├── password.ts      # Argon2 hash/compare
│   │       │   ├── metrics.ts       # Lightweight in-process counters
│   │       │   ├── sentry.ts        # Sentry initialization
│   │       │   └── search.cache.ts  # Redis-backed search result caching
│   │       ├── middleware/
│   │       │   ├── authenticateToken.ts  # Supabase JWT verification
│   │       │   ├── optionalAuth.ts       # Non-blocking auth (public endpoints)
│   │       │   ├── authorizeRole.ts      # RBAC role enforcement
│   │       │   ├── rateLimiter.ts        # Per-route rate limiting
│   │       │   ├── validateBody.ts       # Zod schema validation
│   │       │   └── errorHandler.ts       # Global error handler + Sentry capture
│   │       ├── modules/
│   │       │   ├── auth/            # register, login, sync (OAuth), refresh, logout
│   │       │   ├── students/        # Profile CRUD, privacy settings
│   │       │   ├── skills/          # Skill catalog, student-skill management
│   │       │   ├── projects/        # Portfolio project CRUD
│   │       │   ├── achievements/    # Achievement CRUD
│   │       │   ├── verifications/   # Institution-student verification workflow
│   │       │   ├── credentials/     # RSA-signed credential issue/verify/revoke
│   │       │   ├── audit/           # Immutable audit log queries
│   │       │   ├── uploads/         # Supabase Storage signed-URL uploads
│   │       │   ├── search/          # Full-text search with Redis caching
│   │       │   ├── collaboration/   # Follow, collab requests, project groups
│   │       │   ├── notifications/   # In-app + email notifications
│   │       │   └── recruiters/      # Talent discovery, shortlisting
│   │       └── queue/
│   │           └── credential.queue.ts  # BullMQ worker for async credential signing
│   │
│   ├── web/                         # Next.js 14 web application
│   │   ├── package.json
│   │   └── src/
│   │       ├── app/                 # App Router pages (auth, dashboard, etc.)
│   │       │   ├── auth/            # Login, register, OAuth callback
│   │       │   ├── (student)/       # Student dashboard routes
│   │       │   ├── (institution)/   # Institution admin routes
│   │       │   └── (recruiter)/     # Recruiter portal routes
│   │       ├── lib/
│   │       │   ├── api.ts           # HTTP client (Supabase token injection)
│   │       │   └── supabase.ts      # Supabase browser client
│   │       └── providers/
│   │           └── AuthProvider.tsx  # Auth context (Google OAuth, session)
│   │
│   └── mobile/                      # React Native (Expo 55)
│       ├── package.json
│       ├── app/
│       │   ├── _layout.tsx          # Root layout (Supabase auth state listener)
│       │   ├── (auth)/              # Login, register screens
│       │   └── (tabs)/              # Main tab navigation
│       └── src/
│           ├── lib/
│           │   ├── api.ts           # HTTP client (Supabase token injection)
│           │   └── supabase.ts      # Supabase client + SecureStore adapter
│           └── stores/
│               └── auth.ts          # Zustand auth store (Supabase Session)
│
├── packages/
│   ├── types/                       # @educhain/types
│   │   └── src/index.ts             # Shared interfaces: TokenPayload, UserRole, etc.
│   ├── validators/                  # @educhain/validators
│   │   └── src/                     # Zod schemas per domain module
│   │       ├── auth.ts              # registerSchema, loginSchema, refreshTokenSchema
│   │       ├── student.ts           # updateProfileSchema, etc.
│   │       ├── credential.ts        # issueCredentialSchema, etc.
│   │       ├── skill.ts
│   │       ├── project.ts
│   │       ├── achievement.ts
│   │       ├── collaboration.ts
│   │       ├── search.ts
│   │       ├── recruiter.ts
│   │       └── index.ts             # Re-exports all schemas
│   ├── auth/                        # @educhain/auth
│   │   └── src/index.ts             # createSupabaseBrowserClient, createSupabaseServerClient
│   └── ui/                          # @educhain/ui
│       └── src/index.ts             # Shared React components
│
├── infrastructure/
│   ├── terraform/                   # IaC definitions
│   │   ├── main.tf                  # Root module
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── modules/                 # VPC, ALB, ECS, RDS, Redis, S3, etc.
│   └── monitoring/
│       ├── prometheus.yml           # Metrics scrape config
│       ├── grafana-datasources.yml
│       └── grafana-dashboard.json
│
└── docs/
    ├── production-deployment-guide.md
    └── backup-disaster-recovery.md
```

---

## 4. Development Phases

### Phase 1: Foundation & Scaffolding

```
Components:
  ✅ Turborepo monorepo setup with workspace configuration
  ✅ TypeScript base config (tsconfig.base.json)
  ✅ Fastify API scaffold (app.ts, server.ts, env.ts)
  ✅ Prisma ORM initialization with PostgreSQL datasource
  ✅ Docker Compose for local development (PostgreSQL + Redis)
  ✅ ESLint + Prettier configuration
  ✅ Shared packages: @educhain/types, @educhain/validators
  ✅ Health check endpoint: GET /api/v1/health
  ✅ Error handler with Sentry integration
  ✅ Structured logging (Pino)
```

### Phase 2: Authentication & Student Identity

```
Components:
  ✅ Supabase Auth integration (email/password + Google OAuth)
  ✅ @educhain/auth package (browser + server Supabase clients)
  ✅ authenticateToken middleware (Supabase JWT verification)
  ✅ optionalAuth middleware (non-blocking auth)
  ✅ authorizeRole middleware (RBAC enforcement)
  ✅ Auth module: register, login, sync (OAuth bridge), refresh, logout
  ✅ User model with roles (student, institution_admin, recruiter, platform_admin)
  ✅ Student profile CRUD with privacy settings
  ✅ Institution model with RSA public key storage
  ✅ Student verification request workflow
  ✅ Web: AuthProvider with Google OAuth + session management
  ✅ Web: OAuth callback page with role-based routing
  ✅ Mobile: Supabase client with SecureStore + Google OAuth
```

### Phase 3: Credential Issuance & Verification

```
Components:
  ✅ RSA-2048 key pair generation per institution
  ✅ Credential hash generation (SHA-256, deterministic serialization)
  ✅ RSA-SHA256 digital signature (sign with private key)
  ✅ Signature verification (verify with public key)
  ✅ BullMQ worker for async credential signing
  ✅ Credential issuance endpoint (institution_admin only)
  ✅ Public credential verification endpoint
  ✅ Credential revocation endpoint
  ✅ Audit logging for all credential operations
```

### Phase 4: Search & Discovery

```
Components:
  ✅ PostgreSQL full-text search with GIN indexes (pg_trgm)
  ✅ Student search with filters (skill, institution, graduation year)
  ✅ Skills autocomplete search
  ✅ Redis-backed search result caching (5-minute TTL)
  ✅ Cursor-based pagination for performance
  ✅ Privacy-aware search results (respects profile_visibility)
```

### Phase 5: Collaboration & Social Layer

```
Components:
  ✅ Follow/unfollow system between students
  ✅ Collaboration request workflow (send → accept/reject)
  ✅ Project groups (create, add members, manage)
  ✅ Activity feed logging
  ✅ In-app notifications for social events
  ✅ Email notifications via Resend + BullMQ
```

### Phase 6: Recruiter Portal & Talent Discovery

```
Components:
  ✅ Recruiter profile and registration
  ✅ Talent browse with filters (skills, institution, graduation year)
  ✅ Student profile viewing (respects recruiter_only/public visibility)
  ✅ Shortlist management (add, list, remove, notes)
  ✅ Credential verification from recruiter view
```

### Phase 7: Performance & Optimization

```
Components:
  ✅ Database performance indexes (composite indexes, GIN indexes)
  ✅ Rate limiting (global and per-route)
  ✅ Redis caching strategy (search results, hot queries)
  ✅ Lightweight in-process metrics (request counts, latencies)
  ✅ Sentry error tracking with context (userId, endpoint)
```

---

## 5. Backend Implementation Plan

### Step 1: Project Scaffold

```
1. Initialize Turborepo monorepo with npm workspaces
2. Create apps/api with Fastify 5, TypeScript, Pino logger
3. Configure tsconfig.base.json with strict mode
4. Set up Prisma with PostgreSQL datasource (Supabase)
5. Create Zod-validated env.ts with all required variables
6. Create Docker Compose with PostgreSQL 16 + Redis 7
7. Implement health check: GET /api/v1/health → { status, uptime, version }
8. Implement global error handler with Sentry capture
9. Create @educhain/types and @educhain/validators packages
10. Set up turbo.json pipeline (build, dev, lint, test, typecheck)
```

### Step 2: Authentication Module

```
Supabase Auth handles identity. The API verifies Supabase JWTs and manages application roles.

Prisma Models: User, RefreshToken

API Endpoints:
  POST /api/v1/auth/register    → Create user in DB, hash password (Argon2), return app JWT
  POST /api/v1/auth/login       → Validate credentials, return access + refresh tokens
  POST /api/v1/auth/sync        → Bridge: verify Supabase JWT → find-or-create user in DB
  POST /api/v1/auth/refresh     → Validate refresh token, return new access token
  POST /api/v1/auth/logout      → Delete refresh token

Middleware:
  authenticateToken:
    1. Extract Bearer token from Authorization header
    2. jwt.verify(token, SUPABASE_JWT_SECRET)
    3. Extract email from decoded token
    4. prisma.user.findUnique({ where: { email } })
    5. Attach { userId, email, role } to request.user

  optionalAuth:
    - Same as authenticateToken but fails silently (for public endpoints)

  authorizeRole(allowedRoles):
    - Check request.user.role is in allowedRoles array
    - Return 403 if not authorized

Auth Flow (OAuth):
  1. Client calls Supabase signInWithOAuth({ provider: 'google' })
  2. Supabase handles OAuth redirect + token exchange
  3. Client receives Supabase session (access_token)
  4. Client calls POST /api/v1/auth/sync with Supabase token
  5. API verifies token, creates/finds user record, returns app data

Auth Flow (Email/Password):
  1. Client calls Supabase signUp() or signInWithPassword()
  2. Parallel: Client calls POST /api/v1/auth/register or /login
  3. Both Supabase and API user records are in sync
```

### Step 3: Student Profile Module

```
Prisma Models: Student, Skill, StudentSkill, Project, Achievement

API Endpoints:
  GET    /api/v1/students/me              → Current student profile (with skills, projects, etc.)
  PUT    /api/v1/students/me              → Update profile (bio, degree, graduation_year, visibility)
  GET    /api/v1/students/:id             → Get student by ID (respects privacy settings)

  GET    /api/v1/skills                   → List all skills in catalog
  POST   /api/v1/students/me/skills       → Add skill to profile
  DELETE /api/v1/students/me/skills/:id   → Remove skill from profile

  POST   /api/v1/projects                 → Create project
  GET    /api/v1/projects/:student_id     → Get student's projects
  PUT    /api/v1/projects/:id             → Update project
  DELETE /api/v1/projects/:id             → Delete project

  POST   /api/v1/achievements             → Create achievement
  GET    /api/v1/achievements/:student_id → Get student's achievements
  PUT    /api/v1/achievements/:id         → Update achievement
  DELETE /api/v1/achievements/:id         → Delete achievement

Privacy Logic:
  - profile_visibility = 'public' → visible to all authenticated users
  - profile_visibility = 'recruiter_only' → visible to recruiters + institution_admins
  - profile_visibility = 'private' → visible only to the student themselves
```

### Step 4: Institution & Verification Module

```
Prisma Models: Institution, StudentVerification

API Endpoints:
  POST /api/v1/verifications/request        → Student submits verification request
  GET  /api/v1/verifications/pending        → Institution admin lists pending requests
  POST /api/v1/verifications/:id/approve    → Approve student verification
  POST /api/v1/verifications/:id/reject     → Reject student verification

Internal Services:
  - On institution approval: generate RSA-2048 key pair
  - Store publicKey in institutions table
  - Store privateKeyRef (reference to env/secret management)
```

### Step 5: Credential Module

```
Prisma Models: Credential, AuditLog

API Endpoints:
  POST /api/v1/credentials/issue        → Issue credential (institution_admin only)
  GET  /api/v1/credentials/:student_id  → Get student's credentials
  GET  /api/v1/credentials/verify/:id   → Public verification endpoint
  POST /api/v1/credentials/revoke       → Revoke credential (institution_admin only)

Crypto Services (lib/credential.crypto.ts):
  generateInstitutionKeyPair()     → RSA-2048 PEM key pair
  generateCredentialHash(payload)  → SHA-256 hex hash (deterministic JSON serialization)
  signCredential(hash, privateKey) → RSA-SHA256 base64 signature
  verifyCredentialSignature(hash, signature, publicKey) → boolean

BullMQ Worker (queue/credential.queue.ts):
  - Job: 'credential.sign'
  - Input: { credentialId, institutionId }
  - Process: fetch private key → compute hash → sign → update credential record
  - Runs async after credential creation for non-blocking issuance

Audit Trail:
  - Every credential issue, verify, and revoke writes to audit_logs table
  - Captures: actorId, actorRole, action, entityType, entityId, metadata, timestamp
```

### Step 6: Search Module

```
API Endpoints:
  GET /api/v1/search/students  → Full-text search with filters
  GET /api/v1/search/skills    → Skills autocomplete

Implementation:
  - PostgreSQL full-text search with GIN indexes (pg_trgm extension)
  - Filters: skill, institution, graduation_year, verification_status
  - Cursor-based pagination for consistent performance
  - Redis caching: search result sets cached for 5 minutes (TTL)
  - Privacy enforcement: excludes private profiles from results
  - lib/search.cache.ts: Redis hash-based cache with automatic invalidation
```

### Step 7: Collaboration Module

```
Prisma Models: Follow, CollaborationRequest, Group, GroupMember, ActivityLog

API Endpoints:
  POST   /api/v1/follow/:studentId        → Follow a student
  DELETE /api/v1/follow/:studentId        → Unfollow a student
  GET    /api/v1/followers                → List followers
  GET    /api/v1/following                → List following

  POST   /api/v1/collaboration/request    → Send collaboration request
  POST   /api/v1/collaboration/accept     → Accept request
  POST   /api/v1/collaboration/reject     → Reject request
  GET    /api/v1/collaboration/list       → List requests (sent + received)

  POST   /api/v1/groups                   → Create project group
  GET    /api/v1/groups                   → List user's groups
  POST   /api/v1/groups/:id/members       → Add member to group
  DELETE /api/v1/groups/:id/members/:sid  → Remove member

Triggers (BullMQ jobs):
  - Follow → log activity, optionally notify
  - Collaboration request → notify receiver
  - Collaboration accepted → notify sender
```

### Step 8: Recruiter Module

```
Prisma Models: Recruiter, Shortlist

API Endpoints:
  GET    /api/v1/recruiters/students          → Browse students (with filters/search)
  GET    /api/v1/recruiters/profile/:id       → View student profile (respects visibility)
  POST   /api/v1/recruiters/shortlist         → Add student to shortlist (with optional note)
  GET    /api/v1/recruiters/shortlist         → List shortlisted students
  DELETE /api/v1/recruiters/shortlist/:id     → Remove from shortlist

Access Control:
  - All endpoints require authenticateToken + authorizeRole(['recruiter'])
  - Students with profile_visibility = 'private' are excluded from browse results
  - Students with profile_visibility = 'recruiter_only' are visible to recruiters
```

### Step 9: Notification Module

```
Prisma Models: Notification

API Endpoints:
  GET /api/v1/notifications        → List notifications (paginated)
  PUT /api/v1/notifications/:id    → Mark as read

Triggers (BullMQ jobs):
  - Credential issued → notify student
  - Collaboration request received → notify receiver
  - Collaboration accepted → notify sender
  - Institution verification completed → notify student

Email Notifications (Resend):
  - Credential issued → email via Resend
  - Verification status change → email via Resend
  - Configurable per notification type
  - From address: configurable via RESEND_FROM_EMAIL env var
```

### Step 10: Upload Module

```
API Endpoints:
  POST /api/v1/uploads/certificate   → Upload certificate file
  POST /api/v1/uploads/avatar        → Upload profile avatar

Implementation:
  - Supabase Storage bucket: configurable via SUPABASE_STORAGE_BUCKET env var
  - Files uploaded via Supabase client (server-side with service key)
  - Returns signed URL for client access
  - File type validation and size limits enforced
```

---

## 6. Frontend Implementation Plan

### 6.1 Shared UI Component System

Following atomic design hierarchy:

```
Design Tokens:
  - Dark-first theme with CSS custom properties
  - Colors: Primary #72E0E3 (dark), #0F62FE (light), Surface rgba, etc.
  - Typography: Inter (body) + Space Grotesk (headings)
  - Spacing scale: 4/8/16/24/32px
  - Border radii: 6/12/20px
  - Glassmorphism-lite surface treatment

Atoms:
  - Button (Primary, Secondary, Outline, Danger) with loading states
  - Input (text, password, search) with error states
  - Badge (Verified, Pending, Revoked)
  - Avatar (32/48/72px with initials fallback)
  - Chip (skills/tags)

Molecules:
  - StudentCard (avatar, name, institution, top skills, verification badge)
  - CredentialCard (title, institution, date, verification status)
  - ProjectCard (title, description, repo link)
  - AchievementCard (title, issuer, date)
  - CollaborationRequestCard (avatar, name, message, accept/reject)

Organisms:
  - VirtualStudentID (animated card with QR verification link)
  - StudentProfileHeader (photo, name, institution, degree, follow/collaborate)
  - CredentialList (paginated credential cards)
  - SearchFilterPanel (skill, institution, graduation year filters)
  - ActivityFeed (chronological activity stream)

Layouts:
  - BottomNav (Home, Discover, Projects, Profile — mobile)
  - Sidebar (Dashboard, Students, Credentials, Settings — institution web)
  - TopNav (logo, search, notifications, avatar — web)
```

### 6.2 API Integration Layer

```
All apps share a common API client pattern:

Base HTTP client (fetch wrapper in lib/api.ts):
  - Base URL configuration per environment
  - Supabase session token injection (from supabase.auth.getSession())
  - Standard error handling and type safety
  - Uses @educhain/types for response types

Web (apps/web/src/lib/api.ts):
  - Gets token from Supabase browser client session
  - TanStack Query hooks for data fetching + caching + refetching

Mobile (apps/mobile/src/lib/api.ts):
  - Gets token from Zustand auth store (session.access_token)
  - TanStack Query hooks for data fetching

Service modules per domain:
  - authService (register, login, sync, refresh, logout)
  - studentService (getProfile, updateProfile, getById)
  - skillService (list, add, remove)
  - projectService (CRUD operations)
  - credentialService (list, verify, issue, revoke)
  - collaborationService (follow, request, accept, reject)
  - searchService (students, skills)
  - recruiterService (browse, shortlist)
  - notificationService (list, markRead)
```

### 6.3 Web App (Next.js 14 — App Router)

```
State Management: TanStack Query (server state) + React Context (auth state)
Routing: Next.js App Router with route groups
Auth: Supabase browser client via AuthProvider

Route Structure:
  /auth/login                    → Login (email/password + Google OAuth)
  /auth/register                 → Register (email/password + Google OAuth)
  /auth/callback                 → OAuth callback (sync with API, role-based routing)

  /(student)/dashboard           → Student overview + Virtual Student ID
  /(student)/profile             → Edit profile, skills, projects, achievements
  /(student)/credentials         → View issued credentials
  /(student)/discover            → Search and discover students
  /(student)/collaboration       → Collaboration requests and groups

  /(institution)/dashboard       → Institution stats overview
  /(institution)/students        → Student directory and verification queue
  /(institution)/credentials     → Issue, view history, revoke credentials
  /(institution)/settings        → Institution settings

  /(recruiter)/dashboard         → Recruiter overview
  /(recruiter)/discover          → Talent search with filters
  /(recruiter)/shortlist         → Shortlisted candidates

AuthProvider (providers/AuthProvider.tsx):
  - Listens to supabase.auth.onAuthStateChange()
  - Exposes: user, session, signInWithGoogle(), signOut(), loading
  - Manages token lifecycle automatically

OAuth Callback (app/auth/callback/page.tsx):
  - Exchanges OAuth code via Supabase
  - Calls POST /api/v1/auth/sync to bridge Supabase user → app user
  - Routes to role-appropriate dashboard
```

### 6.4 Mobile App (React Native + Expo 55)

```
State Management: Zustand (auth) + TanStack Query (server state)
Navigation: expo-router (file-based routing)
Auth: Supabase client with SecureStore adapter

Navigation Structure:
  app/_layout.tsx                → Root layout (Supabase auth state listener)
  app/(auth)/login.tsx           → Google OAuth via expo-web-browser
  app/(auth)/register.tsx        → Registration flow
  app/(tabs)/                    → Main tab navigation
    ├── index.tsx                → Home (Virtual Student ID card)
    ├── discover.tsx             → Search students
    ├── projects.tsx             → My projects
    └── profile.tsx              → My profile

Supabase Client (src/lib/supabase.ts):
  - Custom storage adapter using expo-secure-store
  - Encrypted token persistence on device
  - Auto-refresh token on app foreground

Auth Store (src/stores/auth.ts):
  - Zustand store holding Supabase Session object
  - Derived: isAuthenticated, token accessors
  - Updated by auth state listener in _layout.tsx

API Client (src/lib/api.ts):
  - Base URL from environment config
  - Token from auth store (session.access_token)
  - Shared types from @educhain/types
```

---

## 7. Database Implementation Plan

### Prisma Schema Overview

The database is modeled in a single Prisma schema file with 20+ models organized by phase:

```
Enums:
  - UserRole: student | institution_admin | recruiter | platform_admin
  - ProfileVisibility: public | recruiter_only | private
  - VerificationStatus: pending | approved | rejected
  - CredentialStatus: active | revoked
  - CollaborationRequestStatus: pending | accepted | rejected
  - GroupRole: owner | member

Core Models (Phase 1-2):
  - User (id, email, passwordHash, role, timestamps)
  - RefreshToken (id, token, userId, expiresAt)
  - Institution (id, name, domain, verificationStatus, publicKey, privateKeyRef)
  - Student (id, userId, fullName, institutionId, degree, graduationYear, bio, visibility)
  - Skill (id, name)
  - StudentSkill (studentId, skillId — composite PK)
  - Project (id, studentId, title, description, repoLink)
  - Achievement (id, studentId, title, description, issuedBy, date)
  - StudentVerification (id, studentId, institutionId, studentEmail, studentIdNumber, status)

Credential Models (Phase 3):
  - Credential (id, studentId, institutionId, type, title, description, issuedDate,
                 credentialHash, signature, status, certificateUrl)
  - AuditLog (id, actorId, actorRole, action, entityType, entityId, metadata)

Social Models (Phase 5):
  - Follow (followerId, followingId — composite PK)
  - CollaborationRequest (id, senderId, receiverId, message, status)
  - Group (id, name, description, createdBy)
  - GroupMember (groupId, studentId — composite PK, role)
  - Notification (id, userId, type, title, body, read)
  - ActivityLog (id, actorId, action, targetId, metadata)

Recruiter Models (Phase 6):
  - Recruiter (id, userId, companyName, position, bio)
  - Shortlist (recruiterId, studentId — composite PK, note)
```

### Migration Strategy

Migrations are managed by Prisma Migrate and executed in strict dependency order:

```
Existing migrations:
  ├── add_collaboration_social/       # Follow, CollaborationRequest, Group, GroupMember, ActivityLog
  ├── add_recruiter_portal/           # Recruiter, Shortlist
  ├── phase4_search_indexes/          # GIN indexes for full-text search
  └── phase7_performance_indexes/     # Composite indexes for query optimization

Commands:
  npm run db:migrate        → Create + apply migration in dev
  npm run db:migrate:deploy → Apply pending migrations in staging/prod
  npm run db:generate       → Regenerate Prisma client after schema changes
  npm run db:studio         → Open Prisma Studio for visual data browsing
```

### Indexing Strategy

| Table | Index | Type | Purpose |
|---|---|---|---|
| `users` | `email` | UNIQUE B-tree | Login lookup |
| `users` | `role` | B-tree | Role filtering |
| `students` | `user_id` | UNIQUE B-tree | User→Student join |
| `students` | `institution_id` | B-tree | Institution queries |
| `students` | `graduation_year` | B-tree | Year filtering |
| `students` | `full_name` | GIN (pg_trgm) | Full-text search |
| `institutions` | `domain` | UNIQUE B-tree | Domain lookup |
| `credentials` | `student_id` | B-tree | Student credential listing |
| `credentials` | `institution_id` | B-tree | Institution credential history |
| `credentials` | `credential_hash` | B-tree | Hash-based verification lookup |
| `credentials` | `status` | B-tree | Active/revoked filtering |
| `student_skills` | `(student_id, skill_id)` | Composite PK | Relationship lookup |
| `student_skills` | `skill_id` | B-tree | Skill-based student search |
| `skills` | `name` | UNIQUE B-tree | Skill catalog lookup |
| `projects` | `student_id` | B-tree | Student project listing |
| `collaboration_requests` | `sender_id` | B-tree | Sent requests lookup |
| `collaboration_requests` | `receiver_id` | B-tree | Received requests lookup |
| `collaboration_requests` | `status` | B-tree | Status filtering |
| `follows` | `following_id` | B-tree | Follower listing |
| `notifications` | `user_id` | B-tree | User notification listing |
| `notifications` | `read` | B-tree | Unread count queries |
| `notifications` | `created_at` | B-tree | Chronological ordering |
| `audit_logs` | `actor_id` | B-tree | Actor audit history |
| `audit_logs` | `(entity_type, entity_id)` | Composite B-tree | Entity audit trail |
| `audit_logs` | `created_at` | B-tree | Chronological ordering |
| `shortlists` | `student_id` | B-tree | "Who shortlisted me" queries |
| `recruiters` | `company_name` | B-tree | Company search |

### Scaling Best Practices

1. **Connection Pooling:** Supabase includes built-in connection pooling (PgBouncer). Use the pooled connection string for the API.
2. **Read Replicas:** Add a Supabase read replica when recruiter search traffic grows. Route all `GET /search/*` queries to the replica.
3. **Partitioning:** If the credentials table exceeds 10M rows, partition by `institution_id`.
4. **Archiving:** Revoked credentials older than 2 years → move to an archive table.
5. **Vacuum:** Supabase manages autovacuum, but monitor via the dashboard for high-write tables.

---

## 8. DevOps & Deployment Plan

### Environment Setup

| Environment | Purpose | Infrastructure | Deployment |
|---|---|---|---|
| **Development** | Local development | Docker Compose (PostgreSQL + Redis + API) | Manual |
| **Staging** | QA + integration testing | Supabase (staging project) + Railway | Push to `develop` |
| **Production** | Live users | Supabase (prod) + Vercel + Railway | Push to `main` |

### Docker Setup

```
Dockerfile (multi-stage build):
  Stage 1 (builder): Node 20 Alpine → npm ci → tsc build
  Stage 2 (production): Node 20 Alpine → copy dist + node_modules → non-root user

docker-compose.dev.yml:
  - api: Hot-reload with tsx watch, mounted source code
  - postgres: PostgreSQL 16, persistent data volume (port 5432)
  - redis: Redis 7, persistent data volume (port 6379)
  - Environment variables loaded from .env file

docker-compose.yml:
  - Production-ready API container
  - Connects to external Supabase PostgreSQL + Upstash Redis
```

### Environment Variables

```
# Database — Supabase PostgreSQL
DATABASE_URL=postgresql://...

# JWT (internal refresh tokens)
JWT_SECRET=<min 16 chars>
JWT_REFRESH_SECRET=<min 16 chars>

# Supabase Auth
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service role key>
SUPABASE_ANON_KEY=<anon key>
SUPABASE_JWT_SECRET=<supabase jwt secret>
SUPABASE_STORAGE_BUCKET=educhain-files

# Upstash Redis
REDIS_URL=rediss://<upstash-endpoint>:6379

# Resend (transactional email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@educhain.dev

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://educhain.com,https://app.educhain.com

# Client-side (Next.js public vars)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_API_URL=https://api.educhain.com
```

### CI/CD Pipeline (GitHub Actions)

```
Workflow 1: ci.yml (every PR)
  ┌────────────────────────────────────────────┐
  │ Checkout code                               │
  │ Setup Node.js 20                            │
  │ Install dependencies (npm ci)               │
  │ Turborepo: build all packages               │
  │ Turborepo: lint all packages                │
  │ Turborepo: typecheck all packages           │
  │ Turborepo: test all packages (Jest)         │
  └────────────────────────────────────────────┘

Workflow 2: deploy-staging.yml (merge to develop)
  ┌────────────────────────────────────────────┐
  │ Run CI checks                               │
  │ Build API Docker image                      │
  │ Push to container registry                  │
  │ Run Prisma migrations (staging DB)          │
  │ Deploy API to Railway (staging)             │
  │ Deploy web to Vercel (staging)              │
  │ Run smoke tests against staging             │
  └────────────────────────────────────────────┘

Workflow 3: deploy-production.yml (merge to main)
  ┌────────────────────────────────────────────┐
  │ Run CI checks                               │
  │ Build API Docker image                      │
  │ Push to container registry                  │
  │ Manual approval gate                        │
  │ Run Prisma migrations (production DB)       │
  │ Deploy API to Railway (production)          │
  │ Deploy web to Vercel (production)           │
  │ Run smoke tests                             │
  │ Notify team on success/failure              │
  └────────────────────────────────────────────┘
```

### Deployment Targets

| App | Platform | Strategy |
|---|---|---|
| **Web** (Next.js) | Vercel | Automatic on push, preview deployments per PR |
| **API** (Fastify) | Railway or Fly.io | Docker container, health-check based rolling deploy |
| **Mobile** (Expo) | EAS Build + App Store / Google Play | Manual trigger via EAS CLI |
| **Database** | Supabase | Prisma migrations applied via CI pipeline |
| **Cache** | Upstash Redis | Managed, no deployment needed |
| **Storage** | Supabase Storage | Managed, bucket configured via env |

### Monitoring & Observability

```
Error Tracking:
  - Sentry SDK in API (server.ts), web, and mobile
  - Captures: unhandled exceptions, rejected promises, HTTP errors
  - Context: userId, endpoint, request method
  - Source maps uploaded for web + mobile

Application Metrics (lib/metrics.ts):
  - In-process counters: total requests, errors, latency histogram
  - Exposed via GET /metrics endpoint
  - Can be scraped by Prometheus if needed later

Health Check:
  - GET /api/v1/health → { status: 'OK', uptime, version }
  - Used by deployment platforms for readiness/liveness probes

Logging:
  - Pino structured JSON logs
  - Request ID propagation via x-request-id header or auto-generated UUID
  - Log levels: info (default), warn, error
```

---

## 9. Testing Implementation Plan

### Testing Pyramid

```
                 ┌─────────────┐
                 │   E2E Tests │  ← Critical user flows
                ─┤  (Playwright)├─
               / └─────────────┘ \
              /  ┌─────────────┐   \
             │   │  API Tests  │    │  ← Every endpoint
             │  ─┤ (Supertest) ├─   │
             │ / └─────────────┘ \  │
             ┌──────────────────────┐
             │    Unit Tests (Jest) │  ← Functions, services, utils
             └──────────────────────┘
```

### Unit Tests

**Tool:** Jest + ts-jest
**Coverage target:** 80%+
**Location:** Co-located with source (e.g., `credential.crypto.test.ts`)

```
Key test areas:
  - credential.crypto.ts: key generation, hash generation, sign, verify
  - password.ts: Argon2 hash + compare
  - jwt.ts: token generation + validation
  - search.cache.ts: cache key generation, TTL behavior
  - Zod schemas (@educhain/validators): valid/invalid input cases
  - authorizeRole middleware: role enforcement logic
  - Privacy filter logic: public vs recruiter_only vs private

Existing test files:
  - apps/api/src/lib/credential.crypto.test.ts
  - apps/api/src/lib/jwt.test.ts
  - apps/api/src/lib/password.test.ts
  - apps/api/src/lib/search.cache.test.ts
```

### API Tests (Integration)

**Tool:** Supertest (programmatic HTTP testing against Fastify)
**When:** Every PR

```
Test pattern per endpoint:
  - 200: Success with valid input and correct role
  - 400: Bad request with invalid input (Zod validation)
  - 401: Unauthenticated (no token or expired token)
  - 403: Forbidden (wrong role for endpoint)
  - 404: Not found (invalid entity ID)
  - 429: Rate limit exceeded

Key integration flows:
  - Auth: register → login → access protected route
  - OAuth: sync user → create profile → access resources
  - Student: create profile → add skills → searchable via /search/students
  - Credential: institution issues → student sees → public verification works
  - Collaboration: send request → accept → group created → notifications sent
  - Privacy: private profile excluded from search results and recruiter browse
```

### End-to-End Tests

**Tool:** Playwright (web), Detox (mobile, future)
**When:** After staging deployment

```
Critical E2E flows:
  1. Student Google OAuth → complete profile → Virtual Student ID visible
  2. Institution admin → verify student → issue credential → student receives notification
  3. Recruiter → search by skill → view verified profile → credential verification → shortlist
  4. Student A → request collaboration → B accepts → group created
  5. Institution revokes credential → status updates → verification endpoint returns revoked
```

### Performance Tests

**Tool:** k6
**When:** Pre-production releases (manual trigger)

```
Scenarios:
  - 1,000 concurrent users browsing profiles
  - 500 simultaneous search queries
  - 100 credential verification requests/second
  - 50 credential issuance requests/second

Targets:
  - API response time < 500ms (p95)
  - Search response < 1 second (p95)
  - Credential verification < 300ms (p95)
  - Zero errors under normal load
```

### Security Tests

```
OWASP Coverage:
  - Injection: All inputs validated via Zod schemas
  - Auth: Supabase JWT verification, role-based access control
  - Sensitive data: Argon2 password hashing, RSA key management
  - Rate limiting: Global (300/min) + per-route limits
  - CORS: Strict origin allowlist in production
  - Headers: @fastify/helmet for security headers
  - CSRF: Token-based API (stateless, no cookies for auth)

Security scanning:
  - npm audit in CI pipeline
  - Dependency updates via Dependabot
  - Manual penetration testing before major releases
```

---

## 10. Security Architecture

### Authentication Security

| Layer | Mechanism |
|---|---|
| **Identity Provider** | Supabase Auth (email/password + Google OAuth) |
| **Token Format** | Supabase JWT (HS256, signed with project JWT secret) |
| **Token Verification** | API verifies via `jwt.verify(token, SUPABASE_JWT_SECRET)` |
| **Token Lifecycle** | Managed by Supabase client (auto-refresh, secure storage) |
| **Password Hashing** | Argon2 (for API-level local accounts as fallback) |
| **Refresh Tokens** | Stored in DB with expiration, deleted on logout |
| **Role Resolution** | Extracted from application DB (users.role), not from JWT claims |

### Authorization Model (RBAC)

```
Middleware chain for protected routes:
  1. authenticateToken → verify JWT, resolve user from DB
  2. authorizeRole(['role1', 'role2']) → check request.user.role

Role permissions:
  student:           Own profile CRUD, view other public profiles, collaboration, search
  institution_admin: Verify students, issue/revoke credentials, view institution students
  recruiter:         Browse public/recruiter_only profiles, shortlist, verify credentials
  platform_admin:    Full system access (future implementation)
```

### Credential Security

| Aspect | Implementation |
|---|---|
| **Key Algorithm** | RSA-2048 |
| **Hash Algorithm** | SHA-256 (deterministic JSON serialization) |
| **Signature Algorithm** | RSA-SHA256 |
| **Key Storage** | Public key in DB, private key ref in env/secrets |
| **Verification** | Stateless: recompute hash + verify against stored signature + public key |
| **Audit Trail** | Every operation logged to audit_logs table |
| **Revocation** | credential.status field, checked on every verification |

### API Security

| Control | Implementation |
|---|---|
| **Rate Limiting** | @fastify/rate-limit — 300 requests per minute per IP |
| **Input Validation** | Zod schemas via validateBody middleware (every endpoint) |
| **Security Headers** | @fastify/helmet (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS** | Strict origin allowlist in production, credentials: true |
| **Body Limit** | 10 KB max body size (configurable per route) |
| **Request ID** | x-request-id header propagation for tracing |
| **Error Handling** | Sanitized error responses, no stack traces in production |
| **TLS** | Enforced at deployment platform level (Vercel, Railway) |

### Data Protection

| Data | Protection |
|---|---|
| **Passwords** | Argon2 hash (never stored in plaintext) |
| **Tokens** | Supabase manages token encryption; mobile uses SecureStore (encrypted) |
| **RSA Private Keys** | Stored via reference (privateKeyRef), not in main DB |
| **Student Profiles** | Privacy controls (public/recruiter_only/private) enforced at query level |
| **File Uploads** | Supabase Storage with signed URLs (time-limited access) |
| **Database** | Supabase managed encryption at rest, TLS in transit |
| **Redis** | Upstash with TLS (rediss:// protocol) |

---

## 11. Performance & Scaling Strategy

### Current Optimization

| Area | Strategy |
|---|---|
| **Database Queries** | Prisma with select/include (no over-fetching), proper indexes |
| **Search** | PostgreSQL GIN indexes + pg_trgm, cursor-based pagination |
| **Caching** | Redis (Upstash) for search results, 5-minute TTL |
| **Async Processing** | BullMQ for credential signing + notification delivery |
| **API** | Fastify (high throughput), streaming JSON serialization |
| **Frontend** | TanStack Query (client-side caching, stale-while-revalidate) |
| **Mobile** | SecureStore for token persistence (no re-auth on app restart) |

### Scaling Thresholds & Actions

| Metric | Threshold | Action |
|---|---|---|
| API response time (p95) | > 500ms | Add Redis caching, optimize queries |
| Search latency (p95) | > 1s | Add read replica, increase cache TTL |
| Credential verification (p95) | > 300ms | Pre-compute verification results |
| Database connections | > 80% pool | Enable Supabase connection pooling mode |
| Credentials table | > 10M rows | Partition by institution_id |
| Concurrent users | > 5,000 | Scale API horizontally (multiple Railway instances) |
| Redis memory | > 80% | Eviction policy review, shorter TTLs |

### Target Performance Budgets

| Metric | Target |
|---|---|
| API response (p95) | < 500ms |
| Search response (p95) | < 1 second |
| Credential verification (p95) | < 300ms |
| Web Lighthouse score (mobile) | ≥ 90 |
| Mobile cold start | < 3 seconds |
| Time to Interactive (web) | < 2 seconds |

---

## 12. Risk Analysis & Mitigations

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Supabase service outage | Low | High | Graceful degradation; local auth fallback for read-only mode |
| RSA key compromise | Very Low | Critical | Key rotation plan; audit trail for all signing operations; private key isolation |
| Database connection exhaustion | Medium | High | Supabase connection pooling; connection retry with backoff |
| Redis (Upstash) unavailability | Low | Medium | Cache-aside pattern; app continues without cache (slower) |
| Prisma migration failure in prod | Low | High | Test migrations on staging first; manual approval gate in CI |
| OAuth provider (Google) downtime | Low | Medium | Email/password login as fallback; clear user messaging |

### Security Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| JWT secret exposure | Low | Critical | Environment-based secret management; no secrets in code |
| Credential forgery attempt | Low | High | RSA-2048 signatures computationally infeasible to forge |
| Rate limit bypass | Medium | Medium | Multiple layers: per-IP, per-route, per-user |
| Data exfiltration via search | Low | High | Privacy controls at query level; role-based result filtering |
| Dependency vulnerability | Medium | Medium | npm audit in CI; Dependabot automated updates |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Breaking change in shared packages | Medium | Medium | Turborepo build pipeline catches type errors across all apps |
| Slow mobile app review process | Medium | Low | OTA updates via Expo for JS changes; native changes only for major releases |
| Team scaling bottleneck | Medium | Medium | Monorepo enables parallel development; clear module boundaries |
| Cost overrun on managed services | Low | Medium | Supabase free tier for dev; predictable pricing for production |

---

## Appendix A: Key File Reference

| File | Purpose |
|---|---|
| `apps/api/src/server.ts` | Entry point: Prisma connect, Sentry init, build app, BullMQ worker, listen |
| `apps/api/src/app.ts` | Fastify instance, plugins (helmet, cors, rateLimit), route registration |
| `apps/api/src/config/env.ts` | Zod-validated environment variables |
| `apps/api/src/middleware/authenticateToken.ts` | Supabase JWT verification, user lookup by email |
| `apps/api/src/middleware/authorizeRole.ts` | RBAC role enforcement |
| `apps/api/src/lib/credential.crypto.ts` | RSA key gen, SHA-256 hash, sign, verify |
| `apps/api/src/lib/cache.ts` | Redis (ioredis) connection and helpers |
| `apps/api/src/queue/credential.queue.ts` | BullMQ worker for async credential signing |
| `apps/api/prisma/schema.prisma` | Full database schema (20+ models) |
| `apps/web/src/providers/AuthProvider.tsx` | Supabase auth context (Google OAuth, session) |
| `apps/web/src/app/auth/callback/page.tsx` | OAuth callback, API sync, role-based routing |
| `apps/web/src/lib/api.ts` | HTTP client with Supabase token injection |
| `apps/mobile/src/lib/supabase.ts` | Supabase client with SecureStore adapter |
| `apps/mobile/src/stores/auth.ts` | Zustand auth store (Supabase Session) |
| `packages/auth/src/index.ts` | `createSupabaseBrowserClient`, `createSupabaseServerClient` |
| `packages/validators/src/` | Zod schemas for all API inputs |
| `packages/types/src/index.ts` | Shared TypeScript types |

## Appendix B: API Route Summary

| Method | Path | Auth | Role | Module |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | No | — | auth |
| `POST` | `/api/v1/auth/login` | No | — | auth |
| `POST` | `/api/v1/auth/sync` | Yes | — | auth |
| `POST` | `/api/v1/auth/refresh` | No | — | auth |
| `POST` | `/api/v1/auth/logout` | Yes | — | auth |
| `GET` | `/api/v1/students/me` | Yes | student | students |
| `PUT` | `/api/v1/students/me` | Yes | student | students |
| `GET` | `/api/v1/students/:id` | Yes | any | students |
| `GET` | `/api/v1/skills` | Yes | any | skills |
| `POST` | `/api/v1/students/me/skills` | Yes | student | skills |
| `DELETE` | `/api/v1/students/me/skills/:id` | Yes | student | skills |
| `POST` | `/api/v1/projects` | Yes | student | projects |
| `GET` | `/api/v1/projects/:student_id` | Yes | any | projects |
| `PUT` | `/api/v1/projects/:id` | Yes | student | projects |
| `DELETE` | `/api/v1/projects/:id` | Yes | student | projects |
| `POST` | `/api/v1/achievements` | Yes | student | achievements |
| `GET` | `/api/v1/achievements/:student_id` | Yes | any | achievements |
| `PUT` | `/api/v1/achievements/:id` | Yes | student | achievements |
| `DELETE` | `/api/v1/achievements/:id` | Yes | student | achievements |
| `POST` | `/api/v1/verifications/request` | Yes | student | verifications |
| `GET` | `/api/v1/verifications/pending` | Yes | institution_admin | verifications |
| `POST` | `/api/v1/verifications/:id/approve` | Yes | institution_admin | verifications |
| `POST` | `/api/v1/verifications/:id/reject` | Yes | institution_admin | verifications |
| `POST` | `/api/v1/credentials/issue` | Yes | institution_admin | credentials |
| `GET` | `/api/v1/credentials/:student_id` | Yes | any | credentials |
| `GET` | `/api/v1/credentials/verify/:id` | No | — | credentials |
| `POST` | `/api/v1/credentials/revoke` | Yes | institution_admin | credentials |
| `GET` | `/api/v1/search/students` | Yes | any | search |
| `GET` | `/api/v1/search/skills` | Yes | any | search |
| `POST` | `/api/v1/uploads/certificate` | Yes | any | uploads |
| `POST` | `/api/v1/uploads/avatar` | Yes | any | uploads |
| `POST` | `/api/v1/follow/:studentId` | Yes | student | collaboration |
| `DELETE` | `/api/v1/follow/:studentId` | Yes | student | collaboration |
| `POST` | `/api/v1/collaboration/request` | Yes | student | collaboration |
| `POST` | `/api/v1/collaboration/accept` | Yes | student | collaboration |
| `POST` | `/api/v1/collaboration/reject` | Yes | student | collaboration |
| `GET` | `/api/v1/collaboration/list` | Yes | student | collaboration |
| `POST` | `/api/v1/groups` | Yes | student | collaboration |
| `GET` | `/api/v1/groups` | Yes | student | collaboration |
| `POST` | `/api/v1/groups/:id/members` | Yes | student | collaboration |
| `GET` | `/api/v1/notifications` | Yes | any | notifications |
| `PUT` | `/api/v1/notifications/:id` | Yes | any | notifications |
| `GET` | `/api/v1/recruiters/students` | Yes | recruiter | recruiters |
| `GET` | `/api/v1/recruiters/profile/:id` | Yes | recruiter | recruiters |
| `POST` | `/api/v1/recruiters/shortlist` | Yes | recruiter | recruiters |
| `GET` | `/api/v1/recruiters/shortlist` | Yes | recruiter | recruiters |
| `DELETE` | `/api/v1/recruiters/shortlist/:id` | Yes | recruiter | recruiters |
| `GET` | `/api/v1/health` | No | — | core |
| `GET` | `/metrics` | No | — | core |
