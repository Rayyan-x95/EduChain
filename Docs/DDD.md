# Database Design Document (DDD)

**Product:** EduChain ID
**Date:** March 2026
**Status:** Active Development
**ORM:** Prisma 5.12
**Database:** Supabase PostgreSQL 16

---

## 1. Overview

EduChain ID uses **Supabase PostgreSQL** as its primary data store, accessed through **Prisma ORM**. The schema is managed via Prisma migrations, ensuring version-controlled, reproducible database changes.

### Design Principles

- **UUID primary keys** throughout (except `Skill` which uses auto-increment integer)
- **snake_case** table and column names via `@@map` / `@map` conventions
- **Cascade deletes** on child entities when parent is removed
- **Strategic indexes** on foreign keys, filters, and search columns
- **Enum types** for constrained value sets (roles, statuses, visibility)
- **Soft references** for credential private keys (not stored in DB)

---

## 2. Enumerations

| Enum | Values | Used By |
|---|---|---|
| `UserRole` | `student`, `institution_admin`, `recruiter`, `platform_admin` | User |
| `ProfileVisibility` | `public`, `recruiter_only`, `private` | Student |
| `VerificationStatus` | `pending`, `approved`, `rejected` | StudentVerification |
| `CredentialStatus` | `active`, `revoked` | Credential |
| `CollaborationRequestStatus` | `pending`, `accepted`, `rejected` | CollaborationRequest |
| `GroupRole` | `owner`, `member` | GroupMember |

---

## 3. Entity-Relationship Diagram

```
┌──────────┐         ┌──────────────┐
│   User   │◄────────│ RefreshToken │
│  (users) │         │              │
└────┬─────┘         └──────────────┘
     │ 1:1               1:N ▲
     │                        │
     ├──────┐           ┌─────┘
     │      │           │
     ▼      ▼           │
┌─────────┐ ┌──────────┐│  ┌──────────────┐
│ Student │ │Recruiter ││  │ Notification │
│         │ │          ││  │              │
└────┬────┘ └────┬─────┘│  └──────────────┘
     │           │      │
     │           │      │
     │    ┌──────▼──────┴──┐
     │    │   Shortlist    │
     │    └────────────────┘
     │
     ├───────── StudentSkill ──── Skill
     │
     ├───────── Project
     │
     ├───────── Achievement
     │
     ├───────── StudentVerification ──── Institution
     │
     ├───────── Credential ──────────── Institution
     │
     ├───────── Follow (follower/following → Student)
     │
     ├───────── CollaborationRequest (sender/receiver → Student)
     │
     ├───────── Group ────── GroupMember ──── Student
     │
     └───────── ActivityLog


   AuditLog (standalone, references actorId but no FK)
```

---

## 4. Table Definitions

### 4.1 users

Core identity table. Every account has one User record.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, default uuid() | User identifier |
| email | VARCHAR | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR | NOT NULL | Argon2id hashed password |
| role | UserRole | NOT NULL | system role |
| created_at | TIMESTAMP | NOT NULL, default now() | Account creation |
| updated_at | TIMESTAMP | NOT NULL, auto-updated | Last modification |

**Relationships:** 1:N RefreshToken, 0..1 Student, 0..1 Recruiter, 1:N Notification

---

### 4.2 refresh_tokens

Server-side refresh tokens for session management.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Token identifier |
| token | VARCHAR | UNIQUE, NOT NULL | Opaque token string |
| user_id | UUID | FK → users.id (CASCADE) | Owner |
| expires_at | TIMESTAMP | NOT NULL | Expiration time |
| created_at | TIMESTAMP | NOT NULL | Issue time |

**Indexes:** `user_id`, `token`

---

### 4.3 institutions

Organizations that verify students and issue credentials.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Institution identifier |
| name | VARCHAR | NOT NULL | Display name |
| domain | VARCHAR | UNIQUE, NOT NULL | Email domain (e.g., "mit.edu") |
| verification_status | BOOLEAN | NOT NULL, default false | Platform-verified flag |
| public_key | TEXT | NULLABLE | RSA-2048 public key (PEM) |
| private_key_ref | VARCHAR | NULLABLE | Reference to secure key storage |
| created_at | TIMESTAMP | NOT NULL | Registration date |

**Indexes:** `domain`
**Relationships:** 1:N Student, 1:N StudentVerification, 1:N Credential

---

### 4.4 students

Extended profile for users with the `student` role.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Student identifier |
| user_id | UUID | UNIQUE, FK → users.id (CASCADE) | Parent user |
| full_name | VARCHAR | NOT NULL | Display name |
| institution_id | UUID | NULLABLE, FK → institutions.id | Claimed institution |
| degree | VARCHAR | NULLABLE | e.g., "B.S. Computer Science" |
| graduation_year | INT | NULLABLE | Expected graduation |
| bio | VARCHAR | NULLABLE | Profile description |
| profile_visibility | ProfileVisibility | NOT NULL, default public | Privacy setting |
| created_at | TIMESTAMP | NOT NULL | Profile creation |

**Indexes:** `institution_id`, `graduation_year`
**Relationships:** 1:N StudentSkill, 1:N Project, 1:N Achievement, 1:N StudentVerification, 1:N Credential, 1:N Follow (both directions), 1:N CollaborationRequest (both directions), 1:N Group (created), 1:N GroupMember, 1:N ActivityLog, 1:N Shortlist

---

### 4.5 skills

Normalized skill catalog (shared across students).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INT | PK, auto-increment | Skill identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Skill name |

**Relationships:** 1:N StudentSkill

---

### 4.6 student_skills

Many-to-many junction between Student and Skill.

| Column | Type | Constraints | Description |
|---|---|---|---|
| student_id | UUID | PK (composite), FK → students.id (CASCADE) | Student reference |
| skill_id | INT | PK (composite), FK → skills.id (CASCADE) | Skill reference |

**Indexes:** `skill_id`

---

### 4.7 projects

Portfolio projects linked to a student profile.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Project identifier |
| student_id | UUID | FK → students.id (CASCADE) | Owner |
| title | VARCHAR | NOT NULL | Project name |
| description | VARCHAR | NULLABLE | Details |
| repo_link | VARCHAR | NULLABLE | Repository URL |
| created_at | TIMESTAMP | NOT NULL | Entry date |

**Indexes:** `student_id`

---

### 4.8 achievements

Awards, certifications, honors, and accomplishments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Achievement identifier |
| student_id | UUID | FK → students.id (CASCADE) | Owner |
| title | VARCHAR | NOT NULL | Achievement name |
| description | VARCHAR | NULLABLE | Details |
| issued_by | VARCHAR | NULLABLE | Issuing organization |
| date | DATE | NULLABLE | Date received |

**Indexes:** `student_id`

---

### 4.9 student_verifications

Verification requests from students to institutions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Request identifier |
| student_id | UUID | FK → students.id (CASCADE) | Requesting student |
| institution_id | UUID | FK → institutions.id | Target institution |
| student_email | VARCHAR | NOT NULL | Institutional email for verification |
| student_id_number | VARCHAR | NOT NULL | Student ID at institution |
| status | VerificationStatus | NOT NULL, default pending | Review status |
| created_at | TIMESTAMP | NOT NULL | Request date |
| updated_at | TIMESTAMP | NOT NULL | Last status change |

**Indexes:** `student_id`, `institution_id`

---

### 4.10 credentials

Digitally signed academic credentials.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Credential identifier |
| student_id | UUID | FK → students.id (CASCADE) | Recipient |
| institution_id | UUID | FK → institutions.id | Issuing institution |
| credential_type | VARCHAR | NOT NULL | e.g., "degree", "certificate", "transcript" |
| title | VARCHAR | NOT NULL | Credential title |
| description | TEXT | NULLABLE | Full description |
| issued_date | DATE | NOT NULL | Date of issuance |
| credential_hash | VARCHAR | NULLABLE | SHA-256 hash of credential data |
| signature | TEXT | NULLABLE | RSA-SHA256 digital signature |
| status | CredentialStatus | NOT NULL, default active | active/revoked |
| certificate_url | VARCHAR | NULLABLE | Supabase Storage URL |
| created_at | TIMESTAMP | NOT NULL | Record creation |

**Indexes:** `student_id`, `institution_id`, `credential_hash`, `status`

---

### 4.11 audit_logs

Immutable audit trail for compliance-critical actions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Log identifier |
| actor_id | UUID | NOT NULL | User who performed action |
| actor_role | VARCHAR | NOT NULL | Role at time of action |
| action | VARCHAR | NOT NULL | e.g., "credential.issued", "verification.approved" |
| entity_type | VARCHAR | NOT NULL | e.g., "Credential", "StudentVerification" |
| entity_id | UUID | NOT NULL | Target entity ID |
| metadata | JSONB | NULLABLE | Additional context |
| created_at | TIMESTAMP | NOT NULL | Action timestamp |

**Indexes:** `actor_id`, `action`, `(entity_type, entity_id)` composite, `created_at`

**Note:** No cascade FK — audit logs persist even if referenced entities are deleted.

---

### 4.12 follows

Student-to-student follow relationships (social layer).

| Column | Type | Constraints | Description |
|---|---|---|---|
| follower_id | UUID | PK (composite), FK → students.id (CASCADE) | Follower |
| following_id | UUID | PK (composite), FK → students.id (CASCADE) | Followed |
| created_at | TIMESTAMP | NOT NULL | Follow date |

**Indexes:** `following_id`

---

### 4.13 collaboration_requests

Direct collaboration proposals between students.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Request identifier |
| sender_id | UUID | FK → students.id (CASCADE) | Proposer |
| receiver_id | UUID | FK → students.id (CASCADE) | Recipient |
| message | TEXT | NULLABLE | Proposal message |
| status | CollaborationRequestStatus | NOT NULL, default pending | Status |
| created_at | TIMESTAMP | NOT NULL | Sent date |

**Indexes:** `sender_id`, `receiver_id`, `status`

---

### 4.14 groups

Study/project groups created by students.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Group identifier |
| name | VARCHAR | NOT NULL | Group name |
| description | TEXT | NULLABLE | Group description |
| created_by | UUID | FK → students.id (CASCADE) | Creator |
| created_at | TIMESTAMP | NOT NULL | Creation date |

**Indexes:** `created_by`

---

### 4.15 group_members

Group membership junction table.

| Column | Type | Constraints | Description |
|---|---|---|---|
| group_id | UUID | PK (composite), FK → groups.id (CASCADE) | Group reference |
| student_id | UUID | PK (composite), FK → students.id (CASCADE) | Member reference |
| role | GroupRole | NOT NULL, default member | owner/member |
| joined_at | TIMESTAMP | NOT NULL | Join date |

**Indexes:** `student_id`

---

### 4.16 notifications

In-app notification delivery.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Notification identifier |
| user_id | UUID | FK → users.id (CASCADE) | Recipient |
| type | VARCHAR | NOT NULL | Notification category |
| title | VARCHAR | NOT NULL | Notification headline |
| body | TEXT | NULLABLE | Full message |
| read | BOOLEAN | NOT NULL, default false | Read status |
| created_at | TIMESTAMP | NOT NULL | Send date |

**Indexes:** `user_id`, `read`, `created_at`

---

### 4.17 activity_logs

Student activity feed entries.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Log identifier |
| actor_id | UUID | FK → students.id (CASCADE) | Acting student |
| action | VARCHAR | NOT NULL | Activity type |
| target_id | UUID | NULLABLE | Related entity |
| metadata | JSONB | NULLABLE | Additional context |
| created_at | TIMESTAMP | NOT NULL | Activity date |

**Indexes:** `actor_id`, `action`, `created_at`

---

### 4.18 recruiters

Extended profile for users with the `recruiter` role.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Recruiter identifier |
| user_id | UUID | UNIQUE, FK → users.id (CASCADE) | Parent user |
| company_name | VARCHAR | NOT NULL | Company name |
| position | VARCHAR | NULLABLE | Job title |
| bio | TEXT | NULLABLE | Recruiter description |
| created_at | TIMESTAMP | NOT NULL | Profile creation |

**Indexes:** `company_name`

---

### 4.19 shortlists

Recruiter talent bookmarks.

| Column | Type | Constraints | Description |
|---|---|---|---|
| recruiter_id | UUID | PK (composite), FK → recruiters.id (CASCADE) | Recruiter |
| student_id | UUID | PK (composite), FK → students.id (CASCADE) | Shortlisted student |
| note | TEXT | NULLABLE | Private note |
| created_at | TIMESTAMP | NOT NULL | Bookmark date |

**Indexes:** `student_id`

---

## 5. Index Strategy

### Primary Indexes

Every table has a primary key index (UUID or composite).

### Foreign Key Indexes

All `FK` columns are indexed for JOIN performance:

| Table | Indexed Columns |
|---|---|
| refresh_tokens | `user_id`, `token` |
| students | `institution_id`, `graduation_year` |
| student_skills | `skill_id` |
| projects | `student_id` |
| achievements | `student_id` |
| student_verifications | `student_id`, `institution_id` |
| credentials | `student_id`, `institution_id` |
| follows | `following_id` |
| collaboration_requests | `sender_id`, `receiver_id` |
| groups | `created_by` |
| group_members | `student_id` |
| notifications | `user_id` |
| activity_logs | `actor_id` |
| shortlists | `student_id` |

### Search + Filter Indexes

| Table | Index | Purpose |
|---|---|---|
| institutions | `domain` | Domain lookup for institution matching |
| credentials | `credential_hash` | Hash-based credential verification |
| credentials | `status` | Filter active/revoked credentials |
| collaboration_requests | `status` | Filter by request status |
| audit_logs | `(entity_type, entity_id)` | Entity history lookup |
| audit_logs | `created_at` | Chronological audit queries |
| audit_logs | `action` | Action-type filtering |
| notifications | `read` | Unread notification queries |
| notifications | `created_at` | Chronological listing |
| activity_logs | `action` | Activity type filtering |
| activity_logs | `created_at` | Chronological feed |
| recruiters | `company_name` | Company search |

---

## 6. Relationship Summary

| Parent | Child | Type | On Delete |
|---|---|---|---|
| User | RefreshToken | 1:N | CASCADE |
| User | Student | 1:1 | CASCADE |
| User | Recruiter | 1:1 | CASCADE |
| User | Notification | 1:N | CASCADE |
| Institution | Student | 1:N | SET NULL (via nullable FK) |
| Institution | StudentVerification | 1:N | — |
| Institution | Credential | 1:N | — |
| Student | StudentSkill | 1:N | CASCADE |
| Student | Project | 1:N | CASCADE |
| Student | Achievement | 1:N | CASCADE |
| Student | StudentVerification | 1:N | CASCADE |
| Student | Credential | 1:N | CASCADE |
| Student | Follow (follower) | 1:N | CASCADE |
| Student | Follow (following) | 1:N | CASCADE |
| Student | CollaborationRequest (sender) | 1:N | CASCADE |
| Student | CollaborationRequest (receiver) | 1:N | CASCADE |
| Student | Group | 1:N | CASCADE |
| Student | GroupMember | 1:N | CASCADE |
| Student | ActivityLog | 1:N | CASCADE |
| Student | Shortlist | 1:N | CASCADE |
| Skill | StudentSkill | 1:N | CASCADE |
| Group | GroupMember | 1:N | CASCADE |
| Recruiter | Shortlist | 1:N | CASCADE |

---

## 7. Migration History

Prisma migrations are stored in `apps/api/prisma/migrations/`:

| Migration | Description |
|---|---|
| Initial | Core tables: users, refresh_tokens, institutions, students, skills, student_skills, projects, achievements, student_verifications, credentials, audit_logs |
| `add_collaboration_social` | Phase 5: follows, collaboration_requests, groups, group_members, notifications, activity_logs |
| `add_recruiter_portal` | Phase 6: recruiters, shortlists |
| `phase4_search_indexes` | Phase 4: additional indexes for search performance |
| `phase7_performance_indexes` | Phase 7: optimized indexes for production load |

### Migration Commands

```bash
# Development — create and apply migration
npx prisma migrate dev --name <migration_name>

# Production — apply pending migrations
npx prisma migrate deploy

# Regenerate Prisma Client after schema changes
npx prisma generate

# View database in browser
npx prisma studio
```

---

## 8. Credential Integrity Model

Credentials use a **cryptographic verification chain** (NOT blockchain):

```
1. Institution registers → RSA-2048 key pair generated
   ├── public_key   → stored in institutions table
   └── private_key_ref → reference to secure storage

2. Admin issues credential →
   ├── credential_hash = SHA-256(studentId + institutionId + type + title + issuedDate)
   └── signature = RSA-SHA256.sign(credential_hash, private_key)

3. Third party verifies →
   └── RSA-SHA256.verify(credential_hash, signature, public_key) → boolean
```

**Key storage:** Private keys are referenced by `private_key_ref` — the actual key material is NEVER stored in the database.

---

## 9. Data Privacy Design

### Visibility Controls

The `profile_visibility` enum on `Student` controls data exposure:

| Level | Public API | Recruiter API | Owner |
|---|---|---|---|
| `public` | Full profile | Full profile | Full profile |
| `recruiter_only` | Name only | Full profile | Full profile |
| `private` | Name only | Name only | Full profile |

### Data Minimization

- Password hashes use Argon2id (not reversible)
- Refresh tokens expire and are cleaned up
- Audit logs store minimal metadata (JSONB, no raw request bodies)
- Certificate files are in private Supabase Storage buckets (signed URLs for access)

---

## 10. Performance Considerations

### Connection Pooling

Supabase PostgreSQL provides built-in **PgBouncer** connection pooling. Prisma connects through the pooled connection string.

### Query Optimization

- Composite indexes on frequently-queried column pairs
- `@index` on all foreign keys to avoid full table scans on JOINs
- Pagination via cursor-based or offset patterns
- Search queries leverage Redis caching (Upstash) — see `lib/search.cache.ts`

### Table Size Estimates

| Table | Expected Growth | Notes |
|---|---|---|
| users | ~10K/year | Bounded by user signups |
| credentials | ~50K/year | Multiple per student |
| audit_logs | ~500K/year | High volume, append-only |
| notifications | ~1M/year | Bulk generation on events |
| activity_logs | ~200K/year | Feed-style entries |

---

## 11. Backup & Recovery

| Aspect | Strategy |
|---|---|
| Automated backups | Supabase continuous backups (PITR) |
| Retention | Per Supabase plan (7-30 days) |
| Recovery | Point-in-time restore via Supabase dashboard |
| Schema recovery | Replay Prisma migration history from repository |
| Data export | `pg_dump` via Supabase connection string |

---

## 12. Future Schema Considerations

| Feature | Schema Impact |
|---|---|
| Messaging / Chat | New `messages` + `conversations` tables |
| Portfolio Templates | New `portfolio_templates` table + student reference |
| Skill Endorsements | New `endorsements` table (student → student + skill) |
| Institution Analytics | Aggregation views or read replicas |
| Multi-language Profiles | JSONB columns for translated fields |
