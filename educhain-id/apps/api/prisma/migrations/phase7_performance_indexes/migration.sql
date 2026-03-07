-- Performance indexes for production launch
-- Composite indexes for common query patterns

-- Student search: full name text search + visibility filter
CREATE INDEX IF NOT EXISTS idx_students_fullname_visibility
  ON students (profile_visibility, full_name);

-- Credential lookups: student + status combo (common join pattern)
CREATE INDEX IF NOT EXISTS idx_credentials_student_status
  ON credentials (student_id, status);

-- Credential lookups: institution + status combo
CREATE INDEX IF NOT EXISTS idx_credentials_institution_status
  ON credentials (institution_id, status);

-- Notification lookups: user + unread + recent
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read, created_at DESC);

-- Activity log: actor + recent
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_recent
  ON activity_logs (actor_id, created_at DESC);

-- Refresh token expiry (for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires
  ON refresh_tokens (expires_at);

-- Shortlist: recruiter + recent
CREATE INDEX IF NOT EXISTS idx_shortlists_recruiter_recent
  ON shortlists (recruiter_id, created_at DESC);
