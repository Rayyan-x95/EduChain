-- =============================================================================
-- Production Hardening Migration
-- Covers: institution_keys, email_verifications, password_resets,
--         pg_trgm search indexes, composite indexes, notification archival,
--         audit_log partitioning prep, email_verified column, credential timestamps
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Institution Key Storage (replaces in-memory Map)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institution_keys (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id        UUID NOT NULL UNIQUE REFERENCES institutions(id) ON DELETE CASCADE,
  encrypted_private_key TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rotated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_institution_keys_institution ON institution_keys(institution_id);

-- ---------------------------------------------------------------------------
-- 2. Email Verification
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS email_verifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);

-- ---------------------------------------------------------------------------
-- 3. Password Resets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_resets_token ON password_resets(token);

-- ---------------------------------------------------------------------------
-- 4. Credential Timestamps & Key ID (for key rotation + timestamping)
-- ---------------------------------------------------------------------------
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS key_id TEXT;

-- ---------------------------------------------------------------------------
-- 5. pg_trgm Extension & Trigram Search Indexes (Section 3.1)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_students_name_trgm
  ON students USING gin(full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_students_bio_trgm
  ON students USING gin(bio gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_skills_name_trgm
  ON skills USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_institutions_name_trgm
  ON institutions USING gin(name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 6. Composite Indexes (Section 3.2)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_credentials_student_status
  ON credentials(student_id, status);

CREATE INDEX IF NOT EXISTS idx_credentials_institution_status
  ON credentials(institution_id, status);

CREATE INDEX IF NOT EXISTS idx_verifications_student_status
  ON student_verifications(student_id, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON notifications(user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_follower_following
  ON follows(follower_id, following_id);

CREATE INDEX IF NOT EXISTS idx_collab_requests_status_receiver
  ON collaboration_requests(receiver_id, status);

CREATE INDEX IF NOT EXISTS idx_shortlists_recruiter_student
  ON shortlists(recruiter_id, student_id);

CREATE INDEX IF NOT EXISTS idx_endorsements_endorsee_skill
  ON endorsements(endorsee_id, skill_id);

CREATE INDEX IF NOT EXISTS idx_skill_proofs_student_skill
  ON skill_proofs(student_id, skill_id);

-- ---------------------------------------------------------------------------
-- 7. Notification Archive Table (Section 3.3)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications_archive (
  id         UUID PRIMARY KEY,
  user_id    UUID NOT NULL,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_archive_user
  ON notifications_archive(user_id);

-- ---------------------------------------------------------------------------
-- 8. Audit Log Indexes for Partitioning Prep (Section 3.4)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_month
  ON audit_logs(created_at);

-- ---------------------------------------------------------------------------
-- 9. User auth_cache_key for Redis invalidation
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_role_change TIMESTAMPTZ DEFAULT NOW();
