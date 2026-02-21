-- Supabase Row-Level Security (RLS) Policies for EduLink

-- Helper function to get current user ID from JWT claims injected by FastAPI
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid;
$$ LANGUAGE sql STABLE;

-- Helper function to get current user role from JWT claims
CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role';
$$ LANGUAGE sql STABLE;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signing_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Users Table
-- Users can read their own profile and profiles in their institution
CREATE POLICY "Users can view profiles in their institution"
ON users FOR SELECT
USING (
  institution_id = (SELECT institution_id FROM users WHERE id = auth.uid())
  OR profile_visible = true
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid());

-- 2. Institutions Table
-- Anyone can view active institutions
CREATE POLICY "Anyone can view active institutions"
ON institutions FOR SELECT
USING (is_active = true);

-- Only Platform Admins can update institutions
CREATE POLICY "Platform Admins can update institutions"
ON institutions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND user_type = 'PLATFORM_ADMIN'
  )
);

-- 3. Credentials Table
-- Students can view their own credentials
CREATE POLICY "Students can view own credentials"
ON credentials FOR SELECT
USING (
  student_id = auth.uid()
  OR is_public = true
  OR institution_id = (SELECT institution_id FROM users WHERE id = auth.uid() AND user_type IN ('INSTITUTION_ADMIN', 'ISSUER'))
);

-- Institution Admins and Issuers can insert/update credentials for their institution
CREATE POLICY "Institution staff can manage credentials"
ON credentials FOR ALL
USING (
  institution_id = (SELECT institution_id FROM users WHERE id = auth.uid() AND user_type IN ('INSTITUTION_ADMIN', 'ISSUER'))
);

-- 4. Signing Keys Table
-- Only Institution Admins can view/manage signing keys for their institution
CREATE POLICY "Institution Admins can manage signing keys"
ON signing_keys FOR ALL
USING (
  institution_id = (SELECT institution_id FROM users WHERE id = auth.uid() AND user_type = 'INSTITUTION_ADMIN')
);

-- 5. Endorsements Table
-- Anyone can view endorsements
CREATE POLICY "Anyone can view endorsements"
ON endorsements FOR SELECT
USING (true);

-- Users can create endorsements
CREATE POLICY "Users can create endorsements"
ON endorsements FOR INSERT
WITH CHECK (giver_id = auth.uid());

-- Users can delete their own endorsements
CREATE POLICY "Users can delete own endorsements"
ON endorsements FOR DELETE
USING (giver_id = auth.uid());

-- 6. Audit Logs Table
-- Only Institution Admins and Platform Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
USING (
  institution_id = (SELECT institution_id FROM users WHERE id = auth.uid() AND user_type = 'INSTITUTION_ADMIN')
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'PLATFORM_ADMIN')
);

-- System can insert audit logs (bypasses RLS usually, but good to have)
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);
