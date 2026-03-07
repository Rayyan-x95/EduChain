# API Specification

**Product:** EduChain ID
**Date:** March 2026
**Status:** Active Development
**Framework:** Fastify 5.8.1
**Base URL:** `https://api.educhain.com/api/v1`

---

## 1. Overview

The EduChain ID API is a RESTful JSON API built on **Fastify**. It provides 65 endpoints across 13 modules for managing student identity, academic credentials, collaboration, and recruitment.

### Conventions

| Aspect | Convention |
|---|---|
| Protocol | HTTPS only (production) |
| Format | JSON request/response bodies |
| Versioning | URL path prefix `/api/v1` |
| Auth | Bearer token (Supabase JWT) in `Authorization` header |
| Validation | Zod schemas from `@educhain/validators` |
| Errors | Consistent `{ success: false, error: { message, code } }` |
| Pagination | Cursor-based or offset via query params |
| Rate Limiting | Global 300 req/min + stricter on search endpoints |

### Response Format

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
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation failure) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## 2. Authentication

### Strategy

EduChain uses **Supabase Auth** for identity management. The API verifies Supabase-issued JWTs.

### Flow

```
1. Client authenticates via Supabase Auth (Google OAuth or email/password)
2. Client receives Supabase JWT access token
3. Client sends: Authorization: Bearer <supabase_jwt>
4. API middleware verifies JWT using SUPABASE_JWT_SECRET
5. API finds matching user in database by email
6. Request context populated with { userId, email, role }
```

### Middleware Reference

| Middleware | Purpose |
|---|---|
| `authenticateToken` | Required — rejects 401 if no valid JWT |
| `optionalAuth` | Optional — parses JWT but allows anonymous access |
| `authorizeRole([...])` | Role check — rejects 403 if user role not in list |
| `validateBody(schema)` | Body validation — rejects 400 if schema fails |

### Roles

| Role | Access Level |
|---|---|
| `student` | Own profile, skills, projects, achievements, collaboration |
| `institution_admin` | Own institution's verifications, credentials, uploads |
| `recruiter` | Browse + shortlist student profiles |
| `platform_admin` | Full system access |

---

## 3. Endpoints

### 3.0 System

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/health` | — | Health check |
| GET | `/metrics` | — | Application metrics (Prometheus format) |

#### GET /api/v1/health

**Response 200:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2026-03-07T00:00:00.000Z",
    "uptime": 86400,
    "version": "0.1.0"
  }
}
```

---

### 3.1 Auth (`/api/v1/auth`)

| # | Method | Path | Auth | Validation | Description |
|---|---|---|---|---|---|
| 1 | POST | `/auth/register` | — | `registerSchema` | Register new account |
| 2 | POST | `/auth/login` | — | `loginSchema` | Authenticate and get tokens |
| 3 | POST | `/auth/sync` | Bearer | — | Sync user from Supabase Auth |
| 4 | POST | `/auth/refresh` | — | `refreshTokenSchema` | Refresh access token |
| 5 | POST | `/auth/logout` | Bearer | — | Logout and invalidate refresh token |

#### POST /auth/register

**Request:**
```json
{
  "email": "student@university.edu",
  "password": "SecureP@ssword1",
  "role": "student",
  "fullName": "John Doe"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "student" },
    "accessToken": "jwt...",
    "refreshToken": "token..."
  }
}
```

#### POST /auth/login

**Request:**
```json
{
  "email": "student@university.edu",
  "password": "SecureP@ssword1"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "student" },
    "accessToken": "jwt...",
    "refreshToken": "token..."
  }
}
```

#### POST /auth/sync

Syncs the authenticated Supabase user into the local database. Creates or updates the user record.

**Headers:** `Authorization: Bearer <supabase_jwt>`

**Response 200:**
```json
{
  "success": true,
  "data": { "id": "uuid", "email": "...", "role": "student" }
}
```

#### POST /auth/refresh

**Request:**
```json
{
  "refreshToken": "token..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt...",
    "refreshToken": "new_token..."
  }
}
```

#### POST /auth/logout

**Headers:** `Authorization: Bearer <supabase_jwt>`

**Response 200:**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

---

### 3.2 Students (`/api/v1/students`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | GET | `/students` | Optional | — | List visible student profiles |
| 2 | POST | `/students/me` | Bearer | student | Create own student profile |
| 3 | GET | `/students/me` | Bearer | — | Get own student profile |
| 4 | PATCH | `/students/me` | Bearer | student | Update own student profile |
| 5 | GET | `/students/:studentId` | Optional | — | View student profile by ID |

#### POST /students/me

**Request:**
```json
{
  "fullName": "John Doe",
  "institutionId": "uuid",
  "degree": "B.S. Computer Science",
  "graduationYear": 2027,
  "bio": "Full-stack developer passionate about EdTech"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "John Doe",
    "degree": "B.S. Computer Science",
    "graduationYear": 2027,
    "bio": "...",
    "profileVisibility": "public",
    "institution": { "id": "uuid", "name": "MIT" }
  }
}
```

#### PATCH /students/me

**Request (partial):**
```json
{
  "bio": "Updated bio",
  "profileVisibility": "recruiter_only"
}
```

---

### 3.3 Skills (`/api/v1/skills`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | GET | `/skills` | — | — | Browse all skills (public) |
| 2 | GET | `/skills/me` | Bearer | — | Get own skills |
| 3 | POST | `/skills/me` | Bearer | student | Add a skill |
| 4 | DELETE | `/skills/me/:skillId` | Bearer | student | Remove a skill |

#### POST /skills/me

**Request:**
```json
{
  "name": "TypeScript"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { "studentId": "uuid", "skillId": 42, "skill": { "name": "TypeScript" } }
}
```

---

### 3.4 Projects (`/api/v1/projects`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | GET | `/projects/me` | Bearer | — | List own projects |
| 2 | POST | `/projects` | Bearer | student | Create a project |
| 3 | PATCH | `/projects/:projectId` | Bearer | student | Update a project |
| 4 | DELETE | `/projects/:projectId` | Bearer | student | Delete a project |
| 5 | GET | `/projects/:projectId` | — | — | View a project (public) |

#### POST /projects

**Request:**
```json
{
  "title": "EduChain ID",
  "description": "Academic credential verification platform",
  "repoLink": "https://github.com/user/repo"
}
```

---

### 3.5 Achievements (`/api/v1/achievements`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | GET | `/achievements/me` | Bearer | — | List own achievements |
| 2 | POST | `/achievements` | Bearer | student | Create an achievement |
| 3 | PATCH | `/achievements/:achievementId` | Bearer | student | Update an achievement |
| 4 | DELETE | `/achievements/:achievementId` | Bearer | student | Delete an achievement |

#### POST /achievements

**Request:**
```json
{
  "title": "Dean's List 2025",
  "description": "Recognized for academic excellence",
  "issuedBy": "MIT",
  "date": "2025-06-15"
}
```

---

### 3.6 Verifications (`/api/v1/verifications`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | POST | `/verifications` | Bearer | student | Request verification |
| 2 | GET | `/verifications/me` | Bearer | — | List own verification requests |
| 3 | GET | `/verifications/institution/:institutionId` | Bearer | institution_admin, platform_admin | List institution's verification requests |
| 4 | PATCH | `/verifications/:verificationId/review` | Bearer | institution_admin, platform_admin | Approve or reject verification |

#### POST /verifications

**Request:**
```json
{
  "institutionId": "uuid",
  "studentEmail": "john@mit.edu",
  "studentIdNumber": "MIT-2025-1234"
}
```

#### PATCH /verifications/:verificationId/review

**Request:**
```json
{
  "status": "approved"
}
```

---

### 3.7 Credentials (`/api/v1/credentials`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | POST | `/credentials/institutions/:institutionId/keys` | Bearer | institution_admin, platform_admin | Generate RSA key pair |
| 2 | POST | `/credentials/issue` | Bearer | institution_admin | Issue a credential |
| 3 | GET | `/credentials/verify/:credentialId` | — | — | Verify a credential (public) |
| 4 | POST | `/credentials/revoke` | Bearer | institution_admin | Revoke a credential |
| 5 | POST | `/credentials/:credentialId/sign` | Bearer | institution_admin, platform_admin | Trigger signing |
| 6 | PATCH | `/credentials/:credentialId/certificate` | Bearer | institution_admin | Attach certificate file |
| 7 | GET | `/credentials/student/:studentId` | Bearer | — | Get student's credentials |
| 8 | GET | `/credentials/institution/:institutionId` | Bearer | institution_admin, platform_admin | Get institution's credentials |
| 9 | GET | `/credentials/:credentialId` | Bearer | — | Get single credential |

#### POST /credentials/institutions/:institutionId/keys

Generates an RSA-2048 key pair for credential signing. Public key stored in DB, private key referenced securely.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "institutionId": "uuid",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
    "message": "Key pair generated successfully"
  }
}
```

#### POST /credentials/issue

**Request:**
```json
{
  "studentId": "uuid",
  "institutionId": "uuid",
  "credentialType": "degree",
  "title": "Bachelor of Science in Computer Science",
  "description": "Awarded upon completion of all degree requirements",
  "issuedDate": "2026-06-15"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "credentialType": "degree",
    "title": "...",
    "credentialHash": "sha256...",
    "signature": "rsa-sha256...",
    "status": "active"
  }
}
```

#### GET /credentials/verify/:credentialId (Public)

Verifies the cryptographic integrity of a credential.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "credential": {
      "id": "uuid",
      "title": "...",
      "credentialType": "degree",
      "issuedDate": "2026-06-15",
      "status": "active"
    },
    "institution": {
      "name": "MIT",
      "verified": true
    },
    "student": {
      "fullName": "John Doe"
    }
  }
}
```

---

### 3.8 Audit (`/api/v1/audit`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | GET | `/audit/me` | Bearer | — | Get own audit trail |
| 2 | GET | `/audit/:entityType/:entityId` | Bearer | platform_admin, institution_admin | View entity audit log |

#### GET /audit/:entityType/:entityId

**Example:** `GET /api/v1/audit/Credential/uuid`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "actorId": "uuid",
      "actorRole": "institution_admin",
      "action": "credential.issued",
      "entityType": "Credential",
      "entityId": "uuid",
      "metadata": { "credentialType": "degree" },
      "createdAt": "2026-03-07T00:00:00.000Z"
    }
  ]
}
```

---

### 3.9 Uploads (`/api/v1/uploads`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | POST | `/uploads/certificate` | Bearer | institution_admin | Upload certificate file |

#### POST /uploads/certificate

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` — Certificate file (PDF, PNG, JPG)

**Storage:** Supabase Storage (private bucket, signed URL access)

**Response 201:**
```json
{
  "success": true,
  "data": {
    "url": "https://<project>.supabase.co/storage/v1/object/sign/..."
  }
}
```

---

### 3.10 Search (`/api/v1/search`)

| # | Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|---|
| 1 | GET | `/search/students` | Optional | Strict | Full-text student search |
| 2 | GET | `/search/skills` | Optional | Strict | Skill autocomplete |

#### GET /search/students

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `q` | string | Search query (name, skills, institution) |
| `institution` | string | Filter by institution name |
| `skill` | string | Filter by skill |
| `graduationYear` | number | Filter by graduation year |
| `page` | number | Page number (offset pagination) |
| `limit` | number | Results per page (default 20, max 50) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "students": [ ... ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

**Caching:** Results cached in Upstash Redis for 5 minutes with pattern-based invalidation.

---

### 3.11 Collaboration (`/api/v1/...`)

#### Follow System

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | POST | `/follow` | Bearer | student | Follow a student |
| 2 | DELETE | `/follow/:student_id` | Bearer | student | Unfollow a student |
| 3 | GET | `/students/:id/followers` | — | — | Get followers (public) |
| 4 | GET | `/students/:id/following` | — | — | Get following (public) |

#### Collaboration Requests

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 5 | POST | `/collaboration/request` | Bearer | student | Send request |
| 6 | POST | `/collaboration/accept` | Bearer | student | Accept request |
| 7 | POST | `/collaboration/reject` | Bearer | student | Reject request |
| 8 | GET | `/collaboration/list` | Bearer | student | List requests |

#### Groups

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 9 | POST | `/groups` | Bearer | student | Create group |
| 10 | GET | `/groups` | Bearer | student | List my groups |
| 11 | POST | `/groups/:group_id/members` | Bearer | student | Add member |
| 12 | DELETE | `/groups/:group_id/members/:student_id` | Bearer | student | Remove member |

---

### 3.12 Notifications (`/api/v1/notifications`)

| # | Method | Path | Auth | Description |
|---|---|---|---|---|
| 1 | GET | `/notifications` | Bearer | Get own notifications |
| 2 | PUT | `/notifications/:id` | Bearer | Mark notification as read |

#### GET /notifications

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Results per page |
| `unreadOnly` | boolean | Filter to unread only |

---

### 3.13 Recruiters (`/api/v1/recruiters`)

| # | Method | Path | Auth | Role | Description |
|---|---|---|---|---|---|
| 1 | POST | `/recruiters/me` | Bearer | recruiter | Create recruiter profile |
| 2 | GET | `/recruiters/me` | Bearer | recruiter | Get own profile |
| 3 | PATCH | `/recruiters/me` | Bearer | recruiter | Update own profile |
| 4 | GET | `/recruiters/students` | Bearer | recruiter | Browse student profiles |
| 5 | GET | `/recruiters/profile/:id` | Bearer | recruiter | View student full profile |
| 6 | POST | `/recruiters/shortlist` | Bearer | recruiter | Add to shortlist |
| 7 | GET | `/recruiters/shortlist` | Bearer | recruiter | Get shortlisted students |
| 8 | DELETE | `/recruiters/shortlist/:id` | Bearer | recruiter | Remove from shortlist |

#### POST /recruiters/me

**Request:**
```json
{
  "companyName": "TechCorp",
  "position": "Technical Recruiter",
  "bio": "Hiring engineers for our EdTech division"
}
```

#### GET /recruiters/students

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `q` | string | Search query |
| `skill` | string | Filter by skill |
| `institution` | string | Filter by institution |
| `graduationYear` | number | Filter by year |
| `page` | number | Page number |
| `limit` | number | Results per page |

---

## 4. API Security

### Rate Limiting

| Scope | Limit | Window |
|---|---|---|
| Global (all endpoints) | 300 requests | 1 minute |
| Search endpoints | Stricter limit | Per IP |
| Auth endpoints | Stricter limit | Per IP |

### Request Security

| Protection | Implementation |
|---|---|
| HTTPS | Enforced in production |
| CORS | Configurable allowed origins via `CORS_ORIGIN` env |
| Helmet | Security headers (X-Content-Type-Options, etc.) |
| Body size limit | Max 1 MB JSON body |
| Input validation | Zod schemas on all POST/PATCH/PUT bodies |
| SQL injection | Prevented via Prisma ORM (parameterized queries) |
| XSS | JSON-only API (no HTML rendering), Helmet headers |

---

## 5. Validation Schemas

All request bodies are validated using Zod schemas from `@educhain/validators`:

| Schema | Endpoint |
|---|---|
| `registerSchema` | POST /auth/register |
| `loginSchema` | POST /auth/login |
| `refreshTokenSchema` | POST /auth/refresh |
| `createStudentProfileSchema` | POST /students/me |
| `updateStudentProfileSchema` | PATCH /students/me |
| `addSkillSchema` | POST /skills/me |
| `createProjectSchema` | POST /projects |
| `updateProjectSchema` | PATCH /projects/:id |
| `createAchievementSchema` | POST /achievements |
| `updateAchievementSchema` | PATCH /achievements/:id |
| `requestVerificationSchema` | POST /verifications |
| `issueCredentialSchema` | POST /credentials/issue |
| `revokeCredentialSchema` | POST /credentials/revoke |
| `followStudentSchema` | POST /follow |
| `sendCollaborationRequestSchema` | POST /collaboration/request |
| `handleCollaborationRequestSchema` | POST /collaboration/accept, /reject |
| `createGroupSchema` | POST /groups |
| `addGroupMemberSchema` | POST /groups/:id/members |
| `createRecruiterProfileSchema` | POST /recruiters/me |
| `updateRecruiterProfileSchema` | PATCH /recruiters/me |
| `addToShortlistSchema` | POST /recruiters/shortlist |

---

## 6. Error Reference

| Code | HTTP | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `TOKEN_EXPIRED` | 401 | JWT has expired |
| `TOKEN_INVALID` | 401 | JWT is malformed or signature invalid |
| `INSUFFICIENT_ROLE` | 403 | User role not authorized for this endpoint |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `ALREADY_EXISTS` | 409 | Duplicate resource (email, profile, etc.) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error (logged to Sentry) |

---

## 7. Endpoint Summary

| Module | Count | Public | Auth Required |
|---|---|---|---|
| System | 2 | 2 | 0 |
| Auth | 5 | 2 | 3 |
| Students | 5 | 2 (optional auth) | 3 |
| Skills | 4 | 1 | 3 |
| Projects | 5 | 1 | 4 |
| Achievements | 4 | 0 | 4 |
| Verifications | 4 | 0 | 4 |
| Credentials | 9 | 1 | 8 |
| Audit | 2 | 0 | 2 |
| Uploads | 1 | 0 | 1 |
| Search | 2 | 2 (optional auth) | 0 |
| Collaboration | 12 | 2 | 10 |
| Notifications | 2 | 0 | 2 |
| Recruiters | 8 | 0 | 8 |
| **Total** | **65** | **11** | **54** |
