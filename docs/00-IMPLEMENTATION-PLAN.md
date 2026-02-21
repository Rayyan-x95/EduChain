# EduLink — Production-Ready Implementation Plan

> **Version:** 1.0  
> **Date:** 2026-02-20  
> **Type:** Community-Driven Institutional Student Verification Platform  
> **Deployment:** Multi-Tenant SaaS  
> **Trust Model:** PKI Digital Signature Based (ECDSA SECP256R1 + SHA-256)

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Backend Architecture (FastAPI)](#2-backend-architecture-fastapi)
3. [Mobile App Architecture (Flutter)](#3-mobile-app-architecture-flutter)
4. [Admin Panel Architecture (Next.js)](#4-admin-panel-architecture-nextjs)
5. [Database Schema Design](#5-database-schema-design)
6. [API Endpoint Design](#6-api-endpoint-design)
7. [QR Verification Flow](#7-qr-verification-flow)
8. [Digital Signature Flow](#8-digital-signature-flow)
9. [Reputation Algorithm](#9-reputation-algorithm)
10. [DevOps Plan](#10-devops-plan)
11. [Monitoring Plan](#11-monitoring-plan)
12. [Monetization Strategy](#12-monetization-strategy)
13. [Deployment Phases](#13-deployment-phases)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                       │
│                                                                             │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────────────┐    │
│  │ Flutter App   │   │  Next.js Admin   │   │  Recruiter Dashboard     │    │
│  │ (iOS/Android) │   │  Panel (Web)     │   │  (Web)                   │    │
│  └──────┬───────┘   └────────┬─────────┘   └───────────┬──────────────┘    │
│         │                    │                          │                    │
└─────────┼────────────────────┼──────────────────────────┼───────────────────┘
          │                    │                          │
          ▼                    ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                         │
│                     (Nginx / Traefik / Cloud LB)                            │
│                     ┌───────────────────────┐                               │
│                     │  Rate Limiter (Redis)  │                               │
│                     │  CORS / TLS Termination│                               │
│                     └───────────────────────┘                               │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND CLUSTER (FastAPI)                             │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Instance │  │ Instance │  │ Instance │  │ Instance │  │ Instance │    │
│  │    1     │  │    2     │  │    3     │  │    N     │  │  Worker  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                                             │
│  Stateless — JWT Auth — Role-Based — Institution-Scoped Queries             │
└────────┬──────────────┬──────────────┬──────────────┬───────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────────┐
│  PostgreSQL  │ │   Redis    │ │  S3-Compat │ │  Background      │
│  (Primary +  │ │  (Cache +  │ │  Object    │ │  Task Queue      │
│   Read       │ │   Session  │ │  Storage   │ │  (Celery/ARQ)    │
│   Replicas)  │ │   + Rate)  │ │  (MinIO/S3)│ │                  │
└──────────────┘ └────────────┘ └────────────┘ └──────────────────┘
```

### Key Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend Framework | FastAPI (Python 3.11+) | Async, auto OpenAPI docs, type safety |
| Database | PostgreSQL 16 (Supabase or self-hosted) | ACID, JSONB, Row-Level Security |
| Multi-Tenancy | Schema-per-institution OR row-level `institution_id` | Data isolation + scalability |
| Auth | JWT (RS256) + RBAC | Stateless, verifiable, role-scoped |
| Cryptography | ECDSA P-256 + SHA-256 | Industry standard, compact signatures |
| Mobile | Flutter 3.x | Cross-platform, single codebase |
| Admin Panel | Next.js 14 (App Router) | SSR, React ecosystem, TypeScript |
| Object Storage | S3-compatible (MinIO / AWS S3) | Scalable file storage |
| Cache | Redis 7 | Rate limiting, session cache, pub/sub |
| Task Queue | ARQ (async Redis queue) | Lightweight, Python-native async |
| Containerization | Docker + Docker Compose | Reproducible builds |
| API Versioning | URL prefix `/api/v1/` | Clear versioning strategy |

### Multi-Tenancy Strategy

```
┌──────────────────────────────────────────────────────────┐
│                    Single Database                        │
│                                                          │
│  Every table includes: institution_id (UUID, NOT NULL)   │
│                                                          │
│  All queries MUST include institution_id in WHERE clause │
│  Enforced via:                                           │
│    1. SQLAlchemy middleware (auto-inject)                 │
│    2. PostgreSQL Row-Level Security policies              │
│    3. API-layer validation (JWT → institution_id)        │
│                                                          │
│  Index pattern: (institution_id, <primary_lookup_col>)   │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture (FastAPI)

See `docs/01-BACKEND-STRUCTURE.md` for the full folder tree.

### Core Principles

- **Stateless**: No server-side session. All state in JWT + database.
- **Modular**: Each domain (auth, students, credentials, etc.) is a separate module.
- **Layered**: Router → Service → Repository → Database
- **Async**: All I/O operations use `async/await`.
- **Typed**: Full Pydantic v2 models for request/response validation.

### Layer Responsibilities

```
Router (API Layer)
  ├── Request validation (Pydantic)
  ├── Authentication (JWT dependency)
  ├── Authorization (role check dependency)
  └── Calls Service layer

Service (Business Logic)
  ├── Orchestrates business rules
  ├── Calls Repository for data
  ├── Calls external services (S3, email, etc.)
  └── Returns domain objects

Repository (Data Access)
  ├── SQLAlchemy async queries
  ├── Institution-scoped queries
  └── Returns ORM models

Models (Database)
  ├── SQLAlchemy ORM models
  └── Alembic migrations

Schemas (DTOs)
  ├── Request schemas
  ├── Response schemas
  └── Internal transfer objects
```

---

## 3. Mobile App Architecture (Flutter)

See `docs/03-MOBILE-ARCHITECTURE.md` for full details.

### Architecture Pattern: Clean Architecture + BLoC

```
┌─────────────────────────────────────────┐
│              Presentation               │
│  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │  Pages  │  │ Widgets │  │  BLoCs │ │
│  └─────────┘  └─────────┘  └────────┘ │
├─────────────────────────────────────────┤
│               Domain                    │
│  ┌────────────┐  ┌──────────────────┐  │
│  │  Entities  │  │  Use Cases       │  │
│  └────────────┘  └──────────────────┘  │
│  ┌────────────────────────────────────┐ │
│  │  Repository Interfaces (Abstract) │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                Data                     │
│  ┌────────────┐  ┌──────────────────┐  │
│  │   Models   │  │  Data Sources    │  │
│  │   (DTOs)   │  │  (API + Local)   │  │
│  └────────────┘  └──────────────────┘  │
│  ┌────────────────────────────────────┐ │
│  │  Repository Implementations       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Key Mobile Security

- **flutter_secure_storage** for JWT tokens and sensitive data
- **local_auth** for biometric lock (fingerprint/face)
- **root_checker** / **jailbreak detection** at startup
- **Certificate pinning** for API calls
- **Encrypted SQLite** (sqflite + sqlcipher) for offline cache

---

## 4. Admin Panel Architecture (Next.js)

See `docs/04-ADMIN-PANEL-ARCHITECTURE.md` for full details.

### Architecture: Next.js 14 App Router + TypeScript

```
┌────────────────────────────────────────────────────────┐
│                    Next.js Admin Panel                 │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ Auth Module │  │ Dashboard   │  │ Credential Mgmt│  │
│  │ (Login/RBAC)│  │ (Analytics) │  │ (Issue/Revoke) │  │
│  └─────────────┘  └─────────────┘  └────────────────┘  │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ Student Mgmt│  │ Appeal Mgmt │  │ Key Management │  │
│  │ (Verify/Rej)│  │ (Review)    │  │ (Rotate/Pub)   │  │
│  └─────────────┘  └─────────────┘  └────────────────┘  │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ Audit Logs  │  │ Recruiter   │  │ Settings &     │  │
│  │(View/Export)│  │ Portal      │  │ Role Mgmt      │  │
│  └─────────────┘  └─────────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Role-Based UI Rendering

| Role | Accessible Modules |
|---|---|
| SuperAdmin | All modules, key management, role assignment |
| VerificationOfficer | Student verification, appeal review |
| CredentialOfficer | Credential issuance, revocation, templates |
| Viewer | Read-only dashboard, audit logs |

---

## 5. Database Schema Design

See `docs/05-DATABASE-SCHEMA.sql` for complete DDL.

### Entity Relationship Diagram (Simplified)

```
Institutions ─┬── Users ─┬── Credentials ─── CredentialVersions
              │          ├── Appeals
              │          ├── Endorsements (giver/receiver)
              │          ├── Projects
              │          └── ReputationScores
              │
              ├── Roles (institution-scoped)
              ├── Revocations
              ├── AuditLogs
              ├── Blacklist
              └── SigningKeys
```

---

## 6. API Endpoint Design

See `docs/06-API-ENDPOINTS.md` for the complete endpoint reference.

### Endpoint Summary

| Module | Prefix | Endpoints |
|---|---|---|
| Auth | `/api/v1/auth` | 6 |
| Students | `/api/v1/students` | 8 |
| Credentials | `/api/v1/credentials` | 10 |
| Appeals | `/api/v1/appeals` | 5 |
| Endorsements | `/api/v1/endorsements` | 4 |
| Verification (QR) | `/api/v1/verify` | 3 |
| Institutions | `/api/v1/institutions` | 6 |
| Recruiters | `/api/v1/recruiters` | 7 |
| Admin / Keys | `/api/v1/admin` | 8 |
| Community | `/api/v1/community` | 5 |
| GitHub Integration | `/api/v1/github` | 4 |
| Health | `/api/v1/health` | 2 |

---

## 7. QR Verification Flow

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│  Student  │                │  Verifier │                │  Server   │
│  (Sharer) │                │  (Scanner)│                │ (FastAPI) │
└─────┬────┘                └─────┬────┘                └─────┬────┘
      │                           │                           │
      │  1. Request QR Token      │                           │
      │──────────────────────────────────────────────────────►│
      │                           │                           │
      │  2. Server generates:     │                           │
      │     - nonce (UUID)        │                           │
      │     - payload = {         │                           │
      │         student_id,       │                           │
      │         institution_id,   │                           │
      │         status, timestamp,│                           │
      │         nonce, expires_at │                           │
      │       }                   │                           │
      │     - signature = ECDSA(  │                           │
      │         SHA256(payload),  │                           │
      │         institution_key)  │                           │
      │     - token = base64url(  │                           │
      │         payload+signature)│                           │
      │◄──────────────────────────────────────────────────────│
      │                           │                           │
      │  3. Display QR code       │                           │
      │     (contains token)      │                           │
      │     TTL: 10 minutes       │                           │
      │                           │                           │
      │  4. Scan QR ──────────────│                           │
      │                           │                           │
      │                           │  5. POST /verify/qr       │
      │                           │     { token }             │
      │                           │──────────────────────────►│
      │                           │                           │
      │                           │  6. Server validates:     │
      │                           │     - Decode token        │
      │                           │     - Check expiry        │
      │                           │     - Verify nonce unused │
      │                           │     - Verify ECDSA sig    │
      │                           │     - Check student status│
      │                           │     - Mark nonce consumed │
      │                           │                           │
      │                           │  7. Return result         │
      │                           │◄──────────────────────────│
      │                           │                           │
```

---

## 8. Digital Signature Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                  CREDENTIAL ISSUANCE FLOW                         │
│                                                                   │
│  1. CredentialOfficer creates credential via Admin Panel          │
│                                                                   │
│  2. Server builds canonical credential payload:                   │
│     {                                                             │
│       "credential_id": "uuid",                                    │
│       "student_id": "uuid",                                       │
│       "institution_id": "uuid",                                   │
│       "type": "Academic",                                         │
│       "title": "B.Tech Computer Science — Semester 5",            │
│       "issued_at": "2026-02-20T10:00:00Z",                        │
│       "expires_at": "2030-02-20T10:00:00Z",                       │
│       "version": 1,                                               │
│       "metadata": { ... }                                         │
│     }                                                             │
│                                                                   │
│  3. Server computes:                                              │
│     hash = SHA-256(canonical_json(payload))                       │
│                                                                   │
│  4. Server signs:                                                 │
│     signature = ECDSA_Sign(hash, institution_private_key)         │
│     (Key: SECP256R1 / P-256)                                     │
│                                                                   │
│  5. Server stores:                                                │
│     - credential row (payload + hash + signature + key_id)        │
│     - credential_version row (version tracking)                   │
│     - audit_log entry                                             │
│                                                                   │
│  6. Student receives notification → views in Credential Vault     │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                  CREDENTIAL VERIFICATION FLOW                     │
│                                                                   │
│  1. Verifier receives credential (QR / PDF / API)                 │
│                                                                   │
│  2. Extract: payload, signature, key_id                           │
│                                                                   │
│  3. Fetch institution public key:                                 │
│     GET /api/v1/institutions/{id}/keys/{key_id}                   │
│                                                                   │
│  4. Recompute: hash = SHA-256(canonical_json(payload))            │
│                                                                   │
│  5. Verify: ECDSA_Verify(hash, signature, public_key)             │
│                                                                   │
│  6. Check revocation:                                             │
│     GET /api/v1/credentials/{id}/revocation-status                │
│                                                                   │
│  7. Check expiry: expires_at > now()                              │
│                                                                   │
│  8. Result: VALID / INVALID / REVOKED / EXPIRED                   │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                  KEY ROTATION FLOW                                │
│                                                                   │
│  1. SuperAdmin triggers key rotation                              │
│  2. Server generates new ECDSA P-256 keypair                      │
│  3. New key becomes "active"; old key → "rotated" (not deleted)   │
│  4. All NEW credentials signed with new key                       │
│  5. Old credentials remain verifiable via old public key          │
│  6. key_id in credential links to specific key version            │
│  7. Audit log records rotation event                              │
└───────────────────────────────────────────────────────────────────┘
```

---

## 9. Reputation Algorithm

See `docs/09-REPUTATION-ALGORITHM.md` for full specification.

### Formula

```
ReputationScore = (
    W_verification  × verification_score  +
    W_credentials   × credential_score    +
    W_endorsements  × endorsement_score   +
    W_community     × community_score     +
    W_github        × github_score        +
    institution_modifier
)
```

| Component | Weight | Range | Description |
|---|---|---|---|
| verification_score | 0.30 | 0–100 | Verified status, appeal history |
| credential_score | 0.25 | 0–100 | Number & recency of valid credentials |
| endorsement_score | 0.20 | 0–100 | Unique endorsers, diversity |
| community_score | 0.15 | 0–100 | Badges, collaborations |
| github_score | 0.10 | 0–100 | Contribution metadata |
| institution_modifier | — | -20 to +20 | Override by institution admin |

### Anti-Gaming Measures

- Endorsements rate-limited (3 per user per day, no self-endorse)
- Only VERIFIED users can endorse
- Diminishing returns on repeated endorsements from same user
- All weights transparent and published
- Institution can override/cap score

---

## 10. DevOps Plan

See `docs/10-DEVOPS.md` for full details.

### CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Push   │───►│  Lint +  │───►│  Unit +  │───►│  Build   │───►│  Deploy  │
│  to Git  │    │  Format  │    │  Integr. │    │  Docker  │    │  Staging │
│          │    │  Check   │    │  Tests   │    │  Image   │    │  / Prod  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                  ruff/black      pytest          docker build    docker-compose
                  mypy            coverage ≥80%   push to registry
```

---

## 11. Monitoring Plan

| Layer | Tool | What |
|---|---|---|
| Application | Prometheus + Grafana | Request latency, error rate, throughput |
| Logs | Loki / ELK | Structured JSON logs, audit trail |
| Uptime | UptimeRobot / Healthchecks.io | Endpoint availability |
| Alerts | Grafana Alerting | P95 latency > 500ms, error rate > 1% |
| Database | pg_stat_statements | Slow queries, connection pool |
| Security | Audit log table + alerts | Failed auth attempts, key operations |

---

## 12. Monetization Strategy

### Tiered SaaS Model

| Tier | Target | Price | Features |
|---|---|---|---|
| Free | Small clubs/organizations | $0 | ≤50 students, 1 admin, basic verification |
| Campus | Single department/college | $99/mo | ≤2,000 students, 5 admins, credentials, analytics |
| Enterprise | Multi-campus university | $499/mo | Unlimited students, SSO, API access, SLA |
| Recruiter API | Hiring platforms | $0.10/verification | Bulk verification API, search, profiles |

### Additional Revenue

- Premium credential templates
- White-label admin panel
- Priority support SLA
- Custom integrations (LMS, ERP)

---

## 13. Deployment Phases

### Phase 1: Closed Beta (20–50 students)
- Single institution, manual onboarding
- Core: registration, verification, digital ID
- Goal: Validate UX and security model

### Phase 2: Single Campus Pilot
- Full feature set deployed
- Admin panel live for institution staff
- Credential issuance + QR verification
- Goal: Prove institutional value

### Phase 3: Multi-Department Expansion
- Multiple departments within one university
- Role delegation, audit logging
- Recruiter portal beta
- Goal: Scale within institution

### Phase 4: Multi-Campus SaaS
- Self-service institution onboarding
- Full multi-tenancy
- Recruiter API public
- Monetization active
- Goal: Product-market fit + revenue
