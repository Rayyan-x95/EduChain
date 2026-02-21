# API Endpoint Design — EduLink

> Base URL: `https://api.edulink.dev/api/v1`  
> Auth: JWT Bearer Token (RS256)  
> Content-Type: `application/json`  
> All responses follow: `{ "status": "success|error", "data": {...}, "message": "..." }`

---

## 1. Authentication (`/auth`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/auth/register` | No | — | Student self-registration |
| `POST` | `/auth/login` | No | — | Login (returns access + refresh tokens) |
| `POST` | `/auth/refresh` | Refresh Token | — | Refresh access token |
| `POST` | `/auth/verify-email` | No | — | Verify email via token |
| `POST` | `/auth/forgot-password` | No | — | Send password reset email |
| `POST` | `/auth/reset-password` | No | — | Reset password via token |

### Example: `POST /auth/register`

**Request:**
```json
{
  "email": "student@college.edu",
  "password": "SecureP@ss123",
  "full_name": "Rayyan Ahmed",
  "enrollment_number": "CS2024001",
  "program": "B.Tech Computer Science",
  "academic_year": "2024-2028",
  "institution_slug": "mit-bangalore",
  "consent_terms": true,
  "consent_privacy": true
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@college.edu",
    "status": "PENDING",
    "message": "Verification email sent. Awaiting institution approval."
  }
}
```

### Example: `POST /auth/login`

**Request:**
```json
{
  "email": "student@college.edu",
  "password": "SecureP@ss123",
  "institution_slug": "mit-bangalore"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "Rayyan Ahmed",
      "email": "student@college.edu",
      "user_type": "STUDENT",
      "status": "VERIFIED",
      "institution_id": "660e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

---

## 2. Students (`/students`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/students/me` | Yes | Any | Get own profile |
| `PATCH` | `/students/me` | Yes | Student | Update own profile |
| `GET` | `/students/me/id-card` | Yes | Student | Get digital ID card data |
| `GET` | `/students/me/privacy` | Yes | Student | Get privacy settings |
| `PATCH` | `/students/me/privacy` | Yes | Student | Update privacy settings |
| `GET` | `/students/{id}` | Yes | Admin/Recruiter | Get student profile (respects visibility) |
| `PATCH` | `/students/{id}/status` | Yes | VerificationOfficer+ | Approve/Reject/Suspend student |
| `DELETE` | `/students/me/data` | Yes | Student | Request data deletion (GDPR) |

### Example: `GET /students/me/id-card`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "student_name": "Rayyan Ahmed",
    "institution_name": "MIT Bangalore",
    "program": "B.Tech Computer Science",
    "academic_year": "2024-2028",
    "enrollment_number": "CS2024001",
    "status": "VERIFIED",
    "verification_timestamp": "2026-01-15T10:30:00Z",
    "reputation_score": 78.5,
    "avatar_url": "https://storage.edulink.dev/avatars/550e8400.jpg"
  }
}
```

### Example: `PATCH /students/{id}/status`

**Request:**
```json
{
  "status": "REJECTED",
  "reason": "Enrollment number does not match institutional records."
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "new_status": "REJECTED",
    "rejection_reason": "Enrollment number does not match institutional records.",
    "appeal_eligible": true,
    "appeal_deadline": "2026-02-21T10:30:00Z"
  }
}
```

---

## 3. Credentials (`/credentials`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/credentials` | Yes | CredentialOfficer+ | Issue new credential |
| `GET` | `/credentials` | Yes | Student/Admin | List credentials (scoped) |
| `GET` | `/credentials/{id}` | Yes | Owner/Admin | Get credential detail |
| `PATCH` | `/credentials/{id}` | Yes | CredentialOfficer+ | Update credential (new version) |
| `POST` | `/credentials/{id}/revoke` | Yes | CredentialOfficer+ | Revoke credential |
| `GET` | `/credentials/{id}/versions` | Yes | Owner/Admin | List all versions |
| `GET` | `/credentials/{id}/verify` | No | — | Public credential verification |
| `GET` | `/credentials/{id}/revocation-status` | No | — | Public revocation check |
| `POST` | `/credentials/{id}/export/pdf` | Yes | Owner | Export signed PDF |
| `PATCH` | `/credentials/{id}/visibility` | Yes | Student | Toggle public visibility |

### Example: `POST /credentials`

**Request:**
```json
{
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "category": "ACADEMIC",
  "title": "B.Tech Computer Science — Semester 5 Completion",
  "description": "Successfully completed Semester 5 with CGPA 8.7",
  "metadata": {
    "cgpa": 8.7,
    "semester": 5,
    "subjects_completed": 6,
    "distinction": false
  },
  "expires_at": "2030-02-20T00:00:00Z"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "credential_id": "770e8400-e29b-41d4-a716-446655440000",
    "title": "B.Tech Computer Science — Semester 5 Completion",
    "category": "ACADEMIC",
    "version": 1,
    "status": "ACTIVE",
    "payload_hash": "a1b2c3d4e5f6...",
    "signature": "MEUCIQDx...",
    "signing_key_id": "880e8400-e29b-41d4-a716-446655440000",
    "issued_at": "2026-02-20T10:00:00Z",
    "expires_at": "2030-02-20T00:00:00Z"
  }
}
```

---

## 4. Appeals (`/appeals`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/appeals` | Yes | Student | Submit appeal (within 24h window) |
| `GET` | `/appeals/me` | Yes | Student | Get own appeal status |
| `GET` | `/appeals` | Yes | VerificationOfficer+ | List pending appeals |
| `GET` | `/appeals/{id}` | Yes | Officer/Owner | Get appeal detail |
| `PATCH` | `/appeals/{id}/review` | Yes | VerificationOfficer+ | Approve or reject appeal |

### Example: `POST /appeals`

**Request:**
```json
{
  "reason": "My enrollment number was recently updated in the system. Please re-verify with the registrar.",
  "supporting_document": "base64_encoded_file_or_upload_url"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "appeal_id": "990e8400-e29b-41d4-a716-446655440000",
    "status": "SUBMITTED",
    "submitted_at": "2026-02-20T11:00:00Z",
    "appeal_deadline": "2026-02-21T10:30:00Z",
    "message": "Your appeal has been submitted and will be reviewed by the verification officer."
  }
}
```

**Error — appeal window expired (400):**
```json
{
  "status": "error",
  "message": "Appeal window has expired. Appeals must be submitted within 24 hours of rejection.",
  "code": "APPEAL_WINDOW_EXPIRED"
}
```

**Error — already appealed (409):**
```json
{
  "status": "error",
  "message": "You have already submitted an appeal. Only one appeal is allowed.",
  "code": "APPEAL_ALREADY_SUBMITTED"
}
```

---

## 5. Endorsements (`/endorsements`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/endorsements` | Yes | Verified Student | Endorse another student |
| `GET` | `/endorsements/received` | Yes | Student | List endorsements received |
| `GET` | `/endorsements/given` | Yes | Student | List endorsements given |
| `GET` | `/endorsements/user/{id}` | Yes | Any | View user's endorsements (if visible) |

### Example: `POST /endorsements`

**Request:**
```json
{
  "receiver_id": "550e8400-e29b-41d4-a716-446655440001",
  "message": "Excellent collaborator on the ML project. Strong Python skills.",
  "skills": ["Python", "Machine Learning", "Teamwork"]
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "endorsement_id": "aa0e8400-e29b-41d4-a716-446655440000",
    "giver": { "id": "...", "full_name": "Rayyan Ahmed" },
    "receiver": { "id": "...", "full_name": "Priya Sharma" },
    "skills": ["Python", "Machine Learning", "Teamwork"],
    "created_at": "2026-02-20T12:00:00Z"
  }
}
```

**Error — rate limited (429):**
```json
{
  "status": "error",
  "message": "Endorsement rate limit reached. Maximum 3 endorsements per day.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## 6. Verification — QR (`/verify`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/verify/qr/generate` | Yes | Student | Generate short-lived QR token |
| `POST` | `/verify/qr/validate` | No | — | Validate a scanned QR token |
| `POST` | `/verify/credential` | No | — | Verify credential signature |

### Example: `POST /verify/qr/generate`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "qr_token": "eyJzdHVkZW50X2lkIjoiNTUwZTg0MDAuLi4iLCJpbn...",
    "expires_at": "2026-02-20T12:10:00Z",
    "ttl_seconds": 600
  }
}
```

### Example: `POST /verify/qr/validate`

**Request:**
```json
{
  "qr_token": "eyJzdHVkZW50X2lkIjoiNTUwZTg0MDAuLi4iLCJpbn..."
}
```

**Response (200) — Valid:**
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "student": {
      "full_name": "Rayyan Ahmed",
      "institution": "MIT Bangalore",
      "program": "B.Tech Computer Science",
      "academic_year": "2024-2028",
      "status": "VERIFIED",
      "reputation_score": 78.5
    },
    "verification_timestamp": "2026-02-20T12:05:00Z",
    "signature_valid": true
  }
}
```

**Response (200) — Invalid:**
```json
{
  "status": "success",
  "data": {
    "valid": false,
    "reason": "QR token has expired",
    "code": "TOKEN_EXPIRED"
  }
}
```

### Example: `POST /verify/credential`

**Request:**
```json
{
  "credential_id": "770e8400-e29b-41d4-a716-446655440000",
  "payload_hash": "a1b2c3d4e5f6...",
  "signature": "MEUCIQDx..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "credential": {
      "title": "B.Tech Computer Science — Semester 5 Completion",
      "category": "ACADEMIC",
      "issued_at": "2026-02-20T10:00:00Z",
      "status": "ACTIVE",
      "revoked": false,
      "expired": false
    },
    "institution": {
      "name": "MIT Bangalore",
      "verified_key": true
    },
    "signature_valid": true
  }
}
```

---

## 7. Institutions (`/institutions`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/institutions` | Yes | PlatformAdmin | Create institution |
| `GET` | `/institutions` | No | — | List institutions (public) |
| `GET` | `/institutions/{slug}` | No | — | Get institution public info |
| `PATCH` | `/institutions/{id}` | Yes | SuperAdmin | Update institution |
| `GET` | `/institutions/{id}/keys` | No | — | List public keys |
| `GET` | `/institutions/{id}/keys/{key_id}` | No | — | Get specific public key |

### Example: `GET /institutions/{id}/keys`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "institution_id": "660e8400-e29b-41d4-a716-446655440000",
    "keys": [
      {
        "key_id": "880e8400-e29b-41d4-a716-446655440000",
        "algorithm": "ECDSA_P256",
        "public_key_pem": "-----BEGIN PUBLIC KEY-----\nMFkw...\n-----END PUBLIC KEY-----",
        "fingerprint": "SHA256:abc123...",
        "status": "ACTIVE",
        "created_at": "2026-01-01T00:00:00Z"
      },
      {
        "key_id": "880e8400-e29b-41d4-a716-446655440001",
        "algorithm": "ECDSA_P256",
        "public_key_pem": "-----BEGIN PUBLIC KEY-----\nMFkw...\n-----END PUBLIC KEY-----",
        "fingerprint": "SHA256:def456...",
        "status": "ROTATED",
        "created_at": "2025-06-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 8. Recruiters (`/recruiters`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/recruiters/register` | No | — | Recruiter registration |
| `GET` | `/recruiters/search` | Yes | Recruiter | Search verified students |
| `GET` | `/recruiters/students/{id}/profile` | Yes | Recruiter | View opted-in student profile |
| `POST` | `/recruiters/verify/bulk` | Yes | Recruiter | Bulk credential verification |
| `GET` | `/recruiters/reports/{id}` | Yes | Recruiter | Download verification report |
| `POST` | `/recruiters/profile-link` | Yes | Recruiter | Generate temporary public profile link |
| `GET` | `/recruiters/dashboard` | Yes | Recruiter | Recruiter analytics dashboard |

### Example: `GET /recruiters/search`

**Query Parameters:**
```
?program=B.Tech+Computer+Science
&skills=Python,Machine+Learning
&min_reputation=60
&institution_slug=mit-bangalore
&page=1
&per_page=20
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "students": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "Rayyan Ahmed",
        "program": "B.Tech Computer Science",
        "institution": "MIT Bangalore",
        "reputation_score": 78.5,
        "top_skills": ["Python", "Machine Learning", "FastAPI"],
        "credential_count": 5,
        "endorsement_count": 12,
        "github_verified": true
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

## 9. Admin (`/admin`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `POST` | `/admin/keys/generate` | Yes | SuperAdmin | Generate new signing keypair |
| `POST` | `/admin/keys/rotate` | Yes | SuperAdmin | Rotate signing key |
| `GET` | `/admin/keys` | Yes | SuperAdmin | List all keys (including private metadata) |
| `POST` | `/admin/roles/assign` | Yes | SuperAdmin | Assign role to user |
| `DELETE` | `/admin/roles/{id}` | Yes | SuperAdmin | Revoke role |
| `GET` | `/admin/audit-logs` | Yes | SuperAdmin/Viewer | Query audit logs |
| `GET` | `/admin/dashboard` | Yes | Any Admin | Dashboard analytics |
| `POST` | `/admin/reputation/{user_id}/override` | Yes | SuperAdmin | Override reputation modifier |

### Example: `POST /admin/keys/generate`

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "key_id": "880e8400-e29b-41d4-a716-446655440002",
    "algorithm": "ECDSA_P256",
    "fingerprint": "SHA256:ghi789...",
    "status": "ACTIVE",
    "public_key_pem": "-----BEGIN PUBLIC KEY-----\nMFkw...\n-----END PUBLIC KEY-----",
    "created_at": "2026-02-20T14:00:00Z",
    "note": "Previous active key has been rotated to status ROTATED."
  }
}
```

### Example: `GET /admin/audit-logs`

**Query Parameters:**
```
?action=CREDENTIAL_ISSUED
&actor_id=550e8400-e29b-41d4-a716-446655440000
&from=2026-02-01T00:00:00Z
&to=2026-02-20T23:59:59Z
&page=1
&per_page=50
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440000",
        "action": "CREDENTIAL_ISSUED",
        "actor": { "id": "...", "full_name": "Dr. Kumar" },
        "target_type": "credential",
        "target_id": "770e8400-e29b-41d4-a716-446655440000",
        "details": {
          "title": "B.Tech CS Sem 5",
          "student_name": "Rayyan Ahmed"
        },
        "ip_address": "203.0.113.42",
        "created_at": "2026-02-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total": 128,
      "total_pages": 3
    }
  }
}
```

---

## 10. Community (`/community`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/community/reputation/me` | Yes | Student | Get own reputation breakdown |
| `GET` | `/community/reputation/{user_id}` | Yes | Any | View user reputation (if visible) |
| `GET` | `/community/badges` | Yes | Any | List available badges |
| `GET` | `/community/badges/me` | Yes | Student | List own badges |
| `GET` | `/community/leaderboard` | Yes | Any | Top reputation scores (opt-in only) |

---

## 11. GitHub Integration (`/github`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/github/oauth/authorize` | Yes | Student | Get GitHub OAuth URL |
| `POST` | `/github/oauth/callback` | Yes | Student | Handle OAuth callback |
| `GET` | `/github/contributions` | Yes | Student | Get contribution summary |
| `DELETE` | `/github/disconnect` | Yes | Student | Disconnect GitHub account |

### Example: `GET /github/contributions`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "github_username": "rayyan-x95",
    "connected_at": "2026-01-15T08:00:00Z",
    "ownership_verified": true,
    "summary": {
      "public_repos": 23,
      "total_commits_last_year": 847,
      "total_prs": 34,
      "total_issues": 12,
      "top_languages": ["Python", "Dart", "TypeScript"],
      "contribution_streak_days": 45
    }
  }
}
```

---

## 12. Health (`/health`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/health` | No | — | Basic health check |
| `GET` | `/health/ready` | No | — | Readiness check (DB, Redis, S3) |

### Example: `GET /health/ready`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "healthy": true,
    "checks": {
      "database": { "status": "up", "latency_ms": 3 },
      "redis": { "status": "up", "latency_ms": 1 },
      "storage": { "status": "up", "latency_ms": 12 }
    },
    "version": "1.0.0",
    "environment": "production"
  }
}
```

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "status": "error",
  "message": "Human-readable error description",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "enrollment_number",
    "issue": "Already exists for this institution"
  }
}
```

### Standard Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request payload |
| 400 | `APPEAL_WINDOW_EXPIRED` | Appeal deadline passed |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate resource |
| 409 | `APPEAL_ALREADY_SUBMITTED` | One-appeal limit |
| 422 | `UNPROCESSABLE` | Business rule violation |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
