# Database Schema Design — EduLink

> PostgreSQL 16 | Multi-Tenant (institution_id scoping) | UUID primary keys

---

## Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 1. Institutions

```sql
CREATE TABLE institutions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,       -- URL-safe identifier
    domain          VARCHAR(255),                        -- e.g., "mit.edu"
    logo_url        TEXT,
    website         TEXT,
    address         TEXT,
    country         VARCHAR(100),
    
    -- Subscription
    tier            VARCHAR(50) NOT NULL DEFAULT 'free', -- free | campus | enterprise
    max_students    INTEGER NOT NULL DEFAULT 50,
    
    -- Settings
    settings        JSONB NOT NULL DEFAULT '{}',         -- institution-specific config
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_institutions_slug ON institutions(slug);
CREATE INDEX idx_institutions_is_active ON institutions(is_active);
```

---

## 2. Users

```sql
CREATE TYPE user_status AS ENUM (
    'PENDING',
    'VERIFIED', 
    'REJECTED',
    'APPEAL_SUBMITTED',
    'FINAL_REJECTED',
    'SUSPENDED',
    'BLACKLISTED'
);

CREATE TYPE user_type AS ENUM (
    'STUDENT',
    'INSTITUTION_ADMIN',
    'RECRUITER',
    'PLATFORM_ADMIN'
);

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id      UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    -- Identity
    email               VARCHAR(255) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    full_name           VARCHAR(255) NOT NULL,
    
    -- Student-specific fields
    enrollment_number   VARCHAR(100),
    program             VARCHAR(255),                   -- e.g., "B.Tech Computer Science"
    academic_year       VARCHAR(50),                    -- e.g., "2024-2028"
    department          VARCHAR(255),
    
    -- Type & Status
    user_type           user_type NOT NULL DEFAULT 'STUDENT',
    status              user_status NOT NULL DEFAULT 'PENDING',
    
    -- Verification
    email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at   TIMESTAMPTZ,
    verified_at         TIMESTAMPTZ,                    -- institution verification timestamp
    verified_by         UUID REFERENCES users(id),
    rejection_reason    TEXT,
    
    -- Privacy controls
    profile_visible     BOOLEAN NOT NULL DEFAULT TRUE,
    recruiter_opt_in    BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Profile
    avatar_url          TEXT,
    bio                 TEXT,
    phone               VARCHAR(20),
    
    -- GitHub Integration
    github_username     VARCHAR(255),
    github_oauth_token  TEXT,                           -- encrypted at rest
    github_connected_at TIMESTAMPTZ,
    
    -- Metadata
    last_login_at       TIMESTAMPTZ,
    last_login_ip       INET,
    
    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE (institution_id, email),
    UNIQUE (institution_id, enrollment_number)
);

CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_status ON users(institution_id, status);
CREATE INDEX idx_users_email ON users(institution_id, email);
CREATE INDEX idx_users_user_type ON users(institution_id, user_type);
CREATE INDEX idx_users_enrollment ON users(institution_id, enrollment_number);
CREATE INDEX idx_users_recruiter_search ON users(institution_id, status, recruiter_opt_in, program) 
    WHERE status = 'VERIFIED' AND recruiter_opt_in = TRUE;
```

---

## 3. Roles

```sql
CREATE TYPE role_name AS ENUM (
    'SUPER_ADMIN',
    'VERIFICATION_OFFICER',
    'CREDENTIAL_OFFICER',
    'VIEWER'
);

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            role_name NOT NULL,
    
    assigned_by     UUID REFERENCES users(id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Constraints
    UNIQUE (institution_id, user_id, role)
);

CREATE INDEX idx_roles_user ON roles(user_id);
CREATE INDEX idx_roles_institution ON roles(institution_id);
```

---

## 4. Signing Keys

```sql
CREATE TYPE key_status AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED');

CREATE TABLE signing_keys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    key_alias       VARCHAR(100) NOT NULL,               -- human-readable name
    algorithm       VARCHAR(50) NOT NULL DEFAULT 'ECDSA_P256',
    
    -- Key Material
    public_key_pem  TEXT NOT NULL,                        -- PEM-encoded public key
    private_key_enc TEXT NOT NULL,                        -- Encrypted PEM private key (AES-256-GCM)
    key_fingerprint VARCHAR(64) NOT NULL,                 -- SHA-256 of public key (for quick lookup)
    
    status          key_status NOT NULL DEFAULT 'ACTIVE',
    
    -- Lifecycle
    created_by      UUID NOT NULL REFERENCES users(id),
    rotated_at      TIMESTAMPTZ,
    rotated_by      UUID REFERENCES users(id),
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Only one active key per institution at a time
    UNIQUE (institution_id, status) -- partial unique via trigger (only for ACTIVE)
);

CREATE INDEX idx_signing_keys_institution ON signing_keys(institution_id, status);
CREATE INDEX idx_signing_keys_fingerprint ON signing_keys(key_fingerprint);

-- Ensure only one ACTIVE key per institution
CREATE UNIQUE INDEX idx_one_active_key_per_institution 
    ON signing_keys(institution_id) WHERE status = 'ACTIVE';
```

---

## 5. Credentials

```sql
CREATE TYPE credential_category AS ENUM (
    'ACADEMIC',
    'INTERNSHIP', 
    'EVENT',
    'CLUB',
    'RESEARCH'
);

CREATE TYPE credential_status AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'REVOKED',
    'SUPERSEDED'
);

CREATE TABLE credentials (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Credential Content
    category        credential_category NOT NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}',          -- flexible structured data
    
    -- Versioning
    current_version INTEGER NOT NULL DEFAULT 1,
    
    -- Cryptographic Fields
    payload_hash    VARCHAR(64) NOT NULL,                  -- SHA-256 of canonical payload
    signature       TEXT NOT NULL,                          -- Base64-encoded ECDSA signature
    signing_key_id  UUID NOT NULL REFERENCES signing_keys(id),
    
    -- Status
    status          credential_status NOT NULL DEFAULT 'ACTIVE',
    
    -- Lifecycle
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,                           -- NULL = never expires
    issued_by       UUID NOT NULL REFERENCES users(id),
    
    -- Visibility (student-controlled)
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credentials_student ON credentials(institution_id, student_id);
CREATE INDEX idx_credentials_status ON credentials(institution_id, status);
CREATE INDEX idx_credentials_category ON credentials(institution_id, category);
CREATE INDEX idx_credentials_hash ON credentials(payload_hash);
```

---

## 6. Credential Versions

```sql
CREATE TABLE credential_versions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id   UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    version         INTEGER NOT NULL,
    
    -- Snapshot of the credential at this version
    payload         JSONB NOT NULL,
    payload_hash    VARCHAR(64) NOT NULL,
    signature       TEXT NOT NULL,
    signing_key_id  UUID NOT NULL REFERENCES signing_keys(id),
    
    change_reason   TEXT,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (credential_id, version)
);

CREATE INDEX idx_credential_versions_credential ON credential_versions(credential_id);
```

---

## 7. Appeals

```sql
CREATE TYPE appeal_status AS ENUM (
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE appeals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Appeal Content
    reason          TEXT NOT NULL,
    supporting_doc_url TEXT,                              -- optional document upload
    
    -- Status
    status          appeal_status NOT NULL DEFAULT 'SUBMITTED',
    
    -- Server-enforced rules
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    appeal_deadline TIMESTAMPTZ NOT NULL,                  -- submitted_at + 24 hours window
    
    -- Review
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    review_notes    TEXT,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appeals_student ON appeals(institution_id, student_id);
CREATE INDEX idx_appeals_status ON appeals(institution_id, status);

-- Enforce one appeal per student
CREATE UNIQUE INDEX idx_one_appeal_per_student ON appeals(institution_id, student_id);
```

---

## 8. Revocations

```sql
CREATE TABLE revocations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    credential_id   UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    
    reason          TEXT NOT NULL,
    revoked_by      UUID NOT NULL REFERENCES users(id),
    revoked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- For public revocation registry
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    
    UNIQUE (credential_id)
);

CREATE INDEX idx_revocations_credential ON revocations(credential_id);
CREATE INDEX idx_revocations_institution ON revocations(institution_id);
```

---

## 9. Endorsements

```sql
CREATE TABLE endorsements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    giver_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    message         TEXT,                                 -- optional endorsement message
    skills          TEXT[],                               -- array of skill tags
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CHECK (giver_id != receiver_id),                     -- no self-endorsement
    UNIQUE (institution_id, giver_id, receiver_id)       -- one endorsement per pair
);

CREATE INDEX idx_endorsements_receiver ON endorsements(institution_id, receiver_id);
CREATE INDEX idx_endorsements_giver ON endorsements(institution_id, giver_id);
CREATE INDEX idx_endorsements_giver_date ON endorsements(giver_id, created_at);  -- for rate limiting
```

---

## 10. Projects

```sql
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    url             TEXT,                                 -- project link
    
    -- GitHub linkage
    github_repo_url TEXT,
    github_verified BOOLEAN NOT NULL DEFAULT FALSE,       -- ownership verification badge
    
    skills          TEXT[],
    
    is_public       BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(institution_id, user_id);
```

---

## 11. Audit Logs

```sql
CREATE TYPE audit_action AS ENUM (
    -- Auth
    'USER_REGISTERED', 'USER_LOGIN', 'USER_LOGIN_FAILED',
    'EMAIL_VERIFIED', 'PASSWORD_CHANGED',
    
    -- Student Verification
    'STUDENT_APPROVED', 'STUDENT_REJECTED', 'STUDENT_SUSPENDED',
    'STUDENT_BLACKLISTED', 'STUDENT_REINSTATED',
    
    -- Appeals
    'APPEAL_SUBMITTED', 'APPEAL_APPROVED', 'APPEAL_REJECTED',
    
    -- Credentials
    'CREDENTIAL_ISSUED', 'CREDENTIAL_REVOKED', 'CREDENTIAL_UPDATED',
    'CREDENTIAL_EXPORTED',
    
    -- Keys
    'KEY_GENERATED', 'KEY_ROTATED', 'KEY_REVOKED',
    
    -- Roles
    'ROLE_ASSIGNED', 'ROLE_REVOKED',
    
    -- QR
    'QR_TOKEN_GENERATED', 'QR_VERIFIED', 'QR_VERIFICATION_FAILED',
    
    -- Endorsements
    'ENDORSEMENT_GIVEN',
    
    -- Admin
    'INSTITUTION_SETTINGS_UPDATED', 'DATA_EXPORT_REQUESTED',
    'DATA_DELETION_REQUESTED'
);

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    actor_id        UUID REFERENCES users(id),            -- NULL for system actions
    action          audit_action NOT NULL,
    
    -- Context
    target_type     VARCHAR(100),                          -- 'user', 'credential', etc.
    target_id       UUID,
    
    -- Details
    details         JSONB NOT NULL DEFAULT '{}',           -- action-specific metadata
    ip_address      INET,
    user_agent      TEXT,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioned by month for performance (optional at scale)
CREATE INDEX idx_audit_logs_institution ON audit_logs(institution_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(institution_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
```

---

## 12. Blacklist

```sql
CREATE TABLE blacklist (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    reason          TEXT NOT NULL,
    blacklisted_by  UUID NOT NULL REFERENCES users(id),
    blacklisted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Optional expiry (NULL = permanent)
    expires_at      TIMESTAMPTZ,
    
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    
    UNIQUE (institution_id, user_id)
);

CREATE INDEX idx_blacklist_user ON blacklist(institution_id, user_id);
CREATE INDEX idx_blacklist_active ON blacklist(institution_id, is_active);
```

---

## 13. Reputation Scores

```sql
CREATE TABLE reputation_scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Component scores (0-100 each)
    verification_score   DECIMAL(5,2) NOT NULL DEFAULT 0,
    credential_score     DECIMAL(5,2) NOT NULL DEFAULT 0,
    endorsement_score    DECIMAL(5,2) NOT NULL DEFAULT 0,
    community_score      DECIMAL(5,2) NOT NULL DEFAULT 0,
    github_score         DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Institution modifier (-20 to +20)
    institution_modifier DECIMAL(5,2) NOT NULL DEFAULT 0,
    modified_by          UUID REFERENCES users(id),
    modifier_reason      TEXT,
    
    -- Computed total
    total_score          DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Metadata
    last_computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (institution_id, user_id)
);

CREATE INDEX idx_reputation_user ON reputation_scores(institution_id, user_id);
CREATE INDEX idx_reputation_total ON reputation_scores(institution_id, total_score DESC);
```

---

## 14. QR Nonces (Replay Prevention)

```sql
CREATE TABLE qr_nonces (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    nonce           VARCHAR(64) NOT NULL UNIQUE,
    student_id      UUID NOT NULL REFERENCES users(id),
    
    -- Lifecycle
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    consumed_at     TIMESTAMPTZ,                          -- NULL = not yet used
    consumed_by_ip  INET,
    
    is_consumed     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_qr_nonces_nonce ON qr_nonces(nonce);
CREATE INDEX idx_qr_nonces_expiry ON qr_nonces(expires_at) WHERE is_consumed = FALSE;
```

---

## 15. Consent Tracking (Compliance)

```sql
CREATE TABLE consent_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    consent_type    VARCHAR(100) NOT NULL,                 -- 'terms_of_service', 'privacy_policy', 'recruiter_sharing'
    version         VARCHAR(20) NOT NULL,                  -- version of the policy accepted
    
    accepted        BOOLEAN NOT NULL,
    accepted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address      INET,
    
    revoked_at      TIMESTAMPTZ                            -- NULL = still active
);

CREATE INDEX idx_consent_user ON consent_records(institution_id, user_id, consent_type);
```

---

## 16. Community Badges

```sql
CREATE TABLE badges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    icon_url        TEXT,
    criteria        JSONB NOT NULL DEFAULT '{}',           -- auto-award rules
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_badges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id        UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    
    awarded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    awarded_by      UUID REFERENCES users(id),            -- NULL = auto-awarded
    
    UNIQUE (institution_id, user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(institution_id, user_id);
```

---

## Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables with institution_id)

-- Example policy: Users can only see rows from their institution
CREATE POLICY tenant_isolation_users ON users
    USING (institution_id = current_setting('app.current_institution_id')::UUID);

CREATE POLICY tenant_isolation_credentials ON credentials
    USING (institution_id = current_setting('app.current_institution_id')::UUID);

-- Application sets this at the start of each request:
-- SET LOCAL app.current_institution_id = '<institution_uuid>';
```

---

## Migration Strategy (Alembic)

```
alembic/
├── versions/
│   ├── 001_initial_schema.py
│   ├── 002_add_signing_keys.py
│   ├── 003_add_endorsements.py
│   ├── 004_add_reputation.py
│   ├── 005_add_community_badges.py
│   └── 006_add_consent_tracking.py
```

Each migration is:
- **Reversible** (includes `downgrade()`)
- **Idempotent** (safe to re-run)
- **Named descriptively** (timestamp + description)
