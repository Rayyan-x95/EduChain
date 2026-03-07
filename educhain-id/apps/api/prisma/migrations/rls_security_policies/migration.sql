-- ============================================================================
-- EDUCHAIN — ROW LEVEL SECURITY (RLS) MIGRATION
-- Supabase Production Security Hardening
-- ============================================================================
--
-- PURPOSE:
--   Eliminate all Supabase database linter errors by enabling RLS on every
--   table in the public schema and creating fine-grained, role-based access
--   policies that match the application's authorization model.
--
-- SECURITY MODEL:
--   ┌─────────────────────────────────────────────────────────────────────┐
--   │  Supabase Role        │ Maps To                 │ Access Level     │
--   ├─────────────────────────────────────────────────────────────────────┤
--   │  anon                 │ Unauthenticated visitor  │ Public read only │
--   │  authenticated        │ Logged-in user           │ Policy-gated     │
--   │  service_role         │ Backend API (Fastify)    │ Bypasses RLS     │
--   │  postgres             │ Prisma migrations        │ Bypasses RLS     │
--   └─────────────────────────────────────────────────────────────────────┘
--
--   Application roles (stored in users.role):
--     student, institution_admin, recruiter, platform_admin
--
-- AUTH MAPPING:
--   Supabase JWT → auth.jwt() ->> 'email' → public.users.email → app user
--   Helper functions (SECURITY DEFINER, STABLE) map JWT claims to app IDs.
--
-- TABLES SECURED (22):
--   users, refresh_tokens, institutions, students, student_skills, skills,
--   projects, achievements, student_verifications, credentials, audit_logs,
--   follows, collaboration_requests, groups, group_members, notifications,
--   activity_logs, recruiters, shortlists, skill_proofs, endorsements,
--   relationships
--
-- IDEMPOTENT: Safe to re-run. Drops existing policies before re-creating.
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 0: CLEANUP — Drop all existing RLS policies (idempotent)
-- ============================================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      pol.policyname, pol.schemaname, pol.tablename
    );
  END LOOP;
END $$;


-- ============================================================================
-- SECTION 1: HELPER FUNCTIONS
-- ============================================================================
-- All functions are:
--   • SECURITY DEFINER  → run as owner (postgres), bypassing RLS
--   • STABLE            → cached within a single statement; evaluated once
--   • SET search_path   → prevents search_path injection (CWE-426)
-- ============================================================================

-- 1.1 Current user's application UUID (from JWT email claim)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE email = (auth.jwt() ->> 'email');
$$;

-- 1.2 Current user's application role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM users WHERE email = (auth.jwt() ->> 'email');
$$;

-- 1.3 Current user's student record ID (NULL if not a student)
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id FROM students s
  INNER JOIN users u ON s.user_id = u.id
  WHERE u.email = (auth.jwt() ->> 'email');
$$;

-- 1.4 Current user's recruiter record ID (NULL if not a recruiter)
CREATE OR REPLACE FUNCTION public.get_current_recruiter_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id FROM recruiters r
  INNER JOIN users u ON r.user_id = u.id
  WHERE u.email = (auth.jwt() ->> 'email');
$$;

-- 1.5 Institution ID for the current institution_admin (email domain match)
--     NOTE: This mirrors the backend's findAdminInstitution logic.
--     A future improvement should add an explicit institution_id FK on users.
CREATE OR REPLACE FUNCTION public.get_admin_institution_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id FROM institutions i
  INNER JOIN users u ON split_part(u.email, '@', 2) = i.domain
  WHERE u.id = (SELECT id FROM users WHERE email = (auth.jwt() ->> 'email'))
  LIMIT 1;
$$;

-- 1.6 Check if the current user is a member of a specific group
CREATE OR REPLACE FUNCTION public.is_group_member(target_group_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM group_members
    WHERE group_id = target_group_id
    AND student_id = (
      SELECT s.id FROM students s
      INNER JOIN users u ON s.user_id = u.id
      WHERE u.email = (auth.jwt() ->> 'email')
    )
  );
$$;


-- ============================================================================
-- SECTION 2: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_verifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_proofs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships          ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SECTION 3: COLUMN-LEVEL GRANTS — Hide sensitive columns
-- ============================================================================

-- 3.1 users: Expose safe columns only — hide password_hash entirely
REVOKE ALL ON public.users FROM anon, authenticated;

GRANT SELECT (
  id, email, role, username,
  public_identity_slug, identity_visibility,
  created_at, updated_at
) ON public.users TO authenticated;

GRANT UPDATE (
  username, public_identity_slug,
  identity_visibility, updated_at
) ON public.users TO authenticated;

-- 3.2 institutions: Hide private_key_ref from all client roles
REVOKE ALL ON public.institutions FROM anon, authenticated;

GRANT SELECT (
  id, name, domain, verification_status,
  public_key, created_at
) ON public.institutions TO anon;

GRANT SELECT (
  id, name, domain, verification_status,
  public_key, created_at
) ON public.institutions TO authenticated;

GRANT INSERT, UPDATE ON public.institutions TO authenticated;

-- 3.3 refresh_tokens & audit_logs: Complete lockout for client roles
REVOKE ALL ON public.refresh_tokens FROM anon, authenticated;
REVOKE ALL ON public.audit_logs     FROM anon, authenticated;


-- ============================================================================
-- SECTION 4: USERS TABLE POLICIES
-- ============================================================================
-- • Authenticated users read their own row
-- • Platform admins read all rows
-- • Users update only their own row
-- • No anonymous access
-- • No client INSERT/DELETE (backend manages user creation)
-- ============================================================================

CREATE POLICY "users_select_own"
  ON public.users FOR SELECT TO authenticated
  USING (id = public.get_current_user_id());

CREATE POLICY "users_select_admin"
  ON public.users FOR SELECT TO authenticated
  USING (public.get_current_user_role() = 'platform_admin');

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE TO authenticated
  USING  (id = public.get_current_user_id())
  WITH CHECK (id = public.get_current_user_id());


-- ============================================================================
-- SECTION 5: REFRESH_TOKENS — SERVICE ROLE ONLY
-- ============================================================================
-- RLS enabled + all grants revoked + no policies = total lockout.
-- Only service_role (Fastify backend) and postgres can access.
-- ============================================================================
-- (No policies — by design)


-- ============================================================================
-- SECTION 6: INSTITUTIONS TABLE POLICIES
-- ============================================================================
-- • Public read for credential verification (anon + authenticated)
-- • Institution admin updates their own institution
-- • Platform admin has full write access
-- • No client deletion
-- ============================================================================

CREATE POLICY "institutions_select_anon"
  ON public.institutions FOR SELECT TO anon
  USING (true);

CREATE POLICY "institutions_select_authenticated"
  ON public.institutions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "institutions_update_admin"
  ON public.institutions FOR UPDATE TO authenticated
  USING (
    (public.get_current_user_role() = 'institution_admin'
     AND id = public.get_admin_institution_id())
    OR public.get_current_user_role() = 'platform_admin'
  )
  WITH CHECK (
    (public.get_current_user_role() = 'institution_admin'
     AND id = public.get_admin_institution_id())
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "institutions_insert_admin"
  ON public.institutions FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'platform_admin');


-- ============================================================================
-- SECTION 7: STUDENTS TABLE POLICIES
-- ============================================================================
-- Privacy-aware access with three visibility tiers:
--   public         → visible to everyone (anon + authenticated)
--   recruiter_only → visible to recruiters, institution admins, platform admins
--   private        → visible only to owner and platform admins
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;

-- Anon: only public profiles
CREATE POLICY "students_select_anon"
  ON public.students FOR SELECT TO anon
  USING (profile_visibility = 'public');

-- Authenticated: visibility-aware
CREATE POLICY "students_select_authenticated"
  ON public.students FOR SELECT TO authenticated
  USING (
    -- Own profile (always visible to self)
    user_id = public.get_current_user_id()
    -- Public profiles visible to everyone
    OR profile_visibility = 'public'
    -- Recruiter-only visible to recruiters + admins
    OR (profile_visibility = 'recruiter_only'
        AND public.get_current_user_role() IN ('recruiter', 'institution_admin', 'platform_admin'))
    -- Platform admin sees all
    OR public.get_current_user_role() = 'platform_admin'
    -- Institution admin sees their institution's students
    OR (public.get_current_user_role() = 'institution_admin'
        AND institution_id = public.get_admin_institution_id())
  );

-- Students update only their own profile
CREATE POLICY "students_update_own"
  ON public.students FOR UPDATE TO authenticated
  USING  (user_id = public.get_current_user_id())
  WITH CHECK (user_id = public.get_current_user_id());

-- Students create their own student record
CREATE POLICY "students_insert_own"
  ON public.students FOR INSERT TO authenticated
  WITH CHECK (user_id = public.get_current_user_id());


-- ============================================================================
-- SECTION 8: STUDENT_SKILLS TABLE POLICIES
-- ============================================================================
-- Read: follows student visibility. Write: own skills only.
-- ============================================================================

GRANT SELECT, INSERT, DELETE ON public.student_skills TO authenticated;

-- Anon: skills of public students
CREATE POLICY "student_skills_select_anon"
  ON public.student_skills FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_skills.student_id
      AND s.profile_visibility = 'public'
    )
  );

-- Authenticated: own + visibility-gated
CREATE POLICY "student_skills_select_authenticated"
  ON public.student_skills FOR SELECT TO authenticated
  USING (
    student_id = public.get_current_student_id()
    OR public.get_current_user_role() = 'platform_admin'
    OR EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_skills.student_id
      AND (
        s.profile_visibility = 'public'
        OR (s.profile_visibility = 'recruiter_only'
            AND public.get_current_user_role() IN ('recruiter', 'institution_admin', 'platform_admin'))
      )
    )
  );

CREATE POLICY "student_skills_insert_own"
  ON public.student_skills FOR INSERT TO authenticated
  WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "student_skills_delete_own"
  ON public.student_skills FOR DELETE TO authenticated
  USING (student_id = public.get_current_student_id());


-- ============================================================================
-- SECTION 9: SKILLS TABLE POLICIES
-- ============================================================================
-- Public catalog — readable by everyone. Write: service_role only.
-- ============================================================================

GRANT SELECT ON public.skills TO anon, authenticated;

CREATE POLICY "skills_select_anon"
  ON public.skills FOR SELECT TO anon
  USING (true);

CREATE POLICY "skills_select_authenticated"
  ON public.skills FOR SELECT TO authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies → only service_role/postgres can modify


-- ============================================================================
-- SECTION 10: PROJECTS TABLE POLICIES
-- ============================================================================
-- Follow student visibility. Owner has full CRUD.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;

CREATE POLICY "projects_select_anon"
  ON public.projects FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = projects.student_id
      AND s.profile_visibility = 'public'
    )
  );

CREATE POLICY "projects_select_authenticated"
  ON public.projects FOR SELECT TO authenticated
  USING (
    student_id = public.get_current_student_id()
    OR public.get_current_user_role() = 'platform_admin'
    OR EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = projects.student_id
      AND (
        s.profile_visibility = 'public'
        OR (s.profile_visibility = 'recruiter_only'
            AND public.get_current_user_role() IN ('recruiter', 'institution_admin', 'platform_admin'))
      )
    )
  );

CREATE POLICY "projects_insert_own"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "projects_update_own"
  ON public.projects FOR UPDATE TO authenticated
  USING  (student_id = public.get_current_student_id())
  WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "projects_delete_own"
  ON public.projects FOR DELETE TO authenticated
  USING (student_id = public.get_current_student_id());


-- ============================================================================
-- SECTION 11: ACHIEVEMENTS TABLE POLICIES
-- ============================================================================
-- Same visibility model as projects.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;

CREATE POLICY "achievements_select_anon"
  ON public.achievements FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = achievements.student_id
      AND s.profile_visibility = 'public'
    )
  );

CREATE POLICY "achievements_select_authenticated"
  ON public.achievements FOR SELECT TO authenticated
  USING (
    student_id = public.get_current_student_id()
    OR public.get_current_user_role() = 'platform_admin'
    OR EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = achievements.student_id
      AND (
        s.profile_visibility = 'public'
        OR (s.profile_visibility = 'recruiter_only'
            AND public.get_current_user_role() IN ('recruiter', 'institution_admin', 'platform_admin'))
      )
    )
  );

CREATE POLICY "achievements_insert_own"
  ON public.achievements FOR INSERT TO authenticated
  WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "achievements_update_own"
  ON public.achievements FOR UPDATE TO authenticated
  USING  (student_id = public.get_current_student_id())
  WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "achievements_delete_own"
  ON public.achievements FOR DELETE TO authenticated
  USING (student_id = public.get_current_student_id());


-- ============================================================================
-- SECTION 12: STUDENT_VERIFICATIONS TABLE POLICIES
-- ============================================================================
-- Students see their own requests.
-- Institution admins see requests for their institution + update status.
-- Platform admin sees all.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.student_verifications TO authenticated;

CREATE POLICY "verifications_select"
  ON public.student_verifications FOR SELECT TO authenticated
  USING (
    student_id = public.get_current_student_id()
    OR (public.get_current_user_role() = 'institution_admin'
        AND institution_id = public.get_admin_institution_id())
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "verifications_insert_student"
  ON public.student_verifications FOR INSERT TO authenticated
  WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "verifications_update_admin"
  ON public.student_verifications FOR UPDATE TO authenticated
  USING (
    (public.get_current_user_role() = 'institution_admin'
     AND institution_id = public.get_admin_institution_id())
    OR public.get_current_user_role() = 'platform_admin'
  )
  WITH CHECK (
    (public.get_current_user_role() = 'institution_admin'
     AND institution_id = public.get_admin_institution_id())
    OR public.get_current_user_role() = 'platform_admin'
  );


-- ============================================================================
-- SECTION 13: CREDENTIALS TABLE POLICIES
-- ============================================================================
-- PUBLIC READ — anyone can verify a credential (core product feature).
-- Only institution_admin (own institution) and platform_admin can issue/revoke.
-- No deletion — credentials are immutable; revocation changes status.
-- ============================================================================

GRANT SELECT ON public.credentials TO anon;
GRANT SELECT, INSERT, UPDATE ON public.credentials TO authenticated;

CREATE POLICY "credentials_select_anon"
  ON public.credentials FOR SELECT TO anon
  USING (true);

CREATE POLICY "credentials_select_authenticated"
  ON public.credentials FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "credentials_insert_admin"
  ON public.credentials FOR INSERT TO authenticated
  WITH CHECK (
    (public.get_current_user_role() = 'institution_admin'
     AND institution_id = public.get_admin_institution_id())
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "credentials_update_admin"
  ON public.credentials FOR UPDATE TO authenticated
  USING (
    (public.get_current_user_role() = 'institution_admin'
     AND institution_id = public.get_admin_institution_id())
    OR public.get_current_user_role() = 'platform_admin'
  )
  WITH CHECK (
    (public.get_current_user_role() = 'institution_admin'
     AND institution_id = public.get_admin_institution_id())
    OR public.get_current_user_role() = 'platform_admin'
  );


-- ============================================================================
-- SECTION 14: AUDIT_LOGS — SERVICE ROLE ONLY
-- ============================================================================
-- RLS enabled + all grants revoked + zero policies = total lockout.
-- Only service_role (Fastify API) and postgres (migrations) can read/write.
-- ============================================================================
-- (No policies — by design)


-- ============================================================================
-- SECTION 15: FOLLOWS TABLE POLICIES
-- ============================================================================
-- Users see follows where they are follower or following.
-- Users may only create/delete follows where they are the follower.
-- ============================================================================

GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;

CREATE POLICY "follows_select"
  ON public.follows FOR SELECT TO authenticated
  USING (
    follower_id = public.get_current_student_id()
    OR following_id = public.get_current_student_id()
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (follower_id = public.get_current_student_id());

CREATE POLICY "follows_delete_own"
  ON public.follows FOR DELETE TO authenticated
  USING (follower_id = public.get_current_student_id());


-- ============================================================================
-- SECTION 16: COLLABORATION_REQUESTS TABLE POLICIES
-- ============================================================================
-- Sender and receiver can view.
-- Only sender can create.
-- Only receiver can update status (accept/reject).
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.collaboration_requests TO authenticated;

CREATE POLICY "collab_requests_select"
  ON public.collaboration_requests FOR SELECT TO authenticated
  USING (
    sender_id = public.get_current_student_id()
    OR receiver_id = public.get_current_student_id()
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "collab_requests_insert_sender"
  ON public.collaboration_requests FOR INSERT TO authenticated
  WITH CHECK (sender_id = public.get_current_student_id());

CREATE POLICY "collab_requests_update_receiver"
  ON public.collaboration_requests FOR UPDATE TO authenticated
  USING  (receiver_id = public.get_current_student_id())
  WITH CHECK (receiver_id = public.get_current_student_id());


-- ============================================================================
-- SECTION 17: GROUPS TABLE POLICIES
-- ============================================================================
-- Members see groups they belong to.
-- Students create groups (become creator).
-- Only the creator can update or delete.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;

CREATE POLICY "groups_select_member"
  ON public.groups FOR SELECT TO authenticated
  USING (
    created_by = public.get_current_student_id()
    OR public.is_group_member(id)
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "groups_insert_student"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (
    created_by = public.get_current_student_id()
    AND public.get_current_user_role() = 'student'
  );

CREATE POLICY "groups_update_owner"
  ON public.groups FOR UPDATE TO authenticated
  USING  (created_by = public.get_current_student_id())
  WITH CHECK (created_by = public.get_current_student_id());

CREATE POLICY "groups_delete_owner"
  ON public.groups FOR DELETE TO authenticated
  USING (created_by = public.get_current_student_id());


-- ============================================================================
-- SECTION 18: GROUP_MEMBERS TABLE POLICIES
-- ============================================================================
-- Members see other members in their groups.
-- Group owner adds members.
-- Group owner or the member themselves can remove.
-- ============================================================================

GRANT SELECT, INSERT, DELETE ON public.group_members TO authenticated;

CREATE POLICY "group_members_select"
  ON public.group_members FOR SELECT TO authenticated
  USING (
    public.is_group_member(group_id)
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "group_members_insert_owner"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_id
      AND g.created_by = public.get_current_student_id()
    )
  );

CREATE POLICY "group_members_delete"
  ON public.group_members FOR DELETE TO authenticated
  USING (
    -- Members can leave
    student_id = public.get_current_student_id()
    -- Group owner can remove anyone
    OR EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_id
      AND g.created_by = public.get_current_student_id()
    )
  );


-- ============================================================================
-- SECTION 19: NOTIFICATIONS TABLE POLICIES
-- ============================================================================
-- Users see and update (mark read) only their own notifications.
-- No client INSERT or DELETE — backend manages notification lifecycle.
-- ============================================================================

GRANT SELECT, UPDATE ON public.notifications TO authenticated;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = public.get_current_user_id());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING  (user_id = public.get_current_user_id())
  WITH CHECK (user_id = public.get_current_user_id());


-- ============================================================================
-- SECTION 20: ACTIVITY_LOGS TABLE POLICIES
-- ============================================================================
-- Students see their own activity. Platform admin sees all.
-- No client modification — backend only.
-- ============================================================================

GRANT SELECT ON public.activity_logs TO authenticated;

CREATE POLICY "activity_logs_select_own"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (
    actor_id = public.get_current_student_id()
    OR public.get_current_user_role() = 'platform_admin'
  );


-- ============================================================================
-- SECTION 21: RECRUITERS TABLE POLICIES
-- ============================================================================
-- Recruiters manage their own profile.
-- Students can see recruiter profiles (transparency).
-- Platform admin sees all.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.recruiters TO authenticated;

CREATE POLICY "recruiters_select"
  ON public.recruiters FOR SELECT TO authenticated
  USING (
    user_id = public.get_current_user_id()
    OR public.get_current_user_role() IN ('student', 'platform_admin')
  );

CREATE POLICY "recruiters_insert_own"
  ON public.recruiters FOR INSERT TO authenticated
  WITH CHECK (
    user_id = public.get_current_user_id()
    AND public.get_current_user_role() = 'recruiter'
  );

CREATE POLICY "recruiters_update_own"
  ON public.recruiters FOR UPDATE TO authenticated
  USING  (user_id = public.get_current_user_id())
  WITH CHECK (user_id = public.get_current_user_id());


-- ============================================================================
-- SECTION 22: SHORTLISTS TABLE POLICIES
-- ============================================================================
-- Recruiters manage their own shortlists exclusively.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shortlists TO authenticated;

CREATE POLICY "shortlists_select_own"
  ON public.shortlists FOR SELECT TO authenticated
  USING (
    recruiter_id = public.get_current_recruiter_id()
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "shortlists_insert_own"
  ON public.shortlists FOR INSERT TO authenticated
  WITH CHECK (recruiter_id = public.get_current_recruiter_id());

CREATE POLICY "shortlists_update_own"
  ON public.shortlists FOR UPDATE TO authenticated
  USING  (recruiter_id = public.get_current_recruiter_id())
  WITH CHECK (recruiter_id = public.get_current_recruiter_id());

CREATE POLICY "shortlists_delete_own"
  ON public.shortlists FOR DELETE TO authenticated
  USING (recruiter_id = public.get_current_recruiter_id());


-- ============================================================================
-- SECTION 23: SKILL_PROOFS TABLE POLICIES
-- ============================================================================
-- Follow student visibility. Owner has full CRUD.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_proofs TO authenticated;

-- Anon: public student proofs
CREATE POLICY "skill_proofs_select_anon"
  ON public.skill_proofs FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = skill_proofs.student_id
      AND s.profile_visibility = 'public'
    )
  );

CREATE POLICY "skill_proofs_select_authenticated"
  ON public.skill_proofs FOR SELECT TO authenticated
  USING (
    student_id = public.get_current_student_id()
    OR public.get_current_user_role() = 'platform_admin'
    OR EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = skill_proofs.student_id
      AND (
        s.profile_visibility = 'public'
        OR (s.profile_visibility = 'recruiter_only'
            AND public.get_current_user_role() IN ('recruiter', 'institution_admin', 'platform_admin'))
      )
    )
  );

CREATE POLICY "skill_proofs_insert_own"
  ON public.skill_proofs FOR INSERT TO authenticated
  WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "skill_proofs_update_own"
  ON public.skill_proofs FOR UPDATE TO authenticated
  USING  (student_id = public.get_current_student_id())
  WITH CHECK (student_id = public.get_current_student_id());

CREATE POLICY "skill_proofs_delete_own"
  ON public.skill_proofs FOR DELETE TO authenticated
  USING (student_id = public.get_current_student_id());


-- ============================================================================
-- SECTION 24: ENDORSEMENTS TABLE POLICIES
-- ============================================================================
-- Endorser and endorsee can see endorsements.
-- Public-profile endorsements visible to all authenticated users.
-- Only the endorser can create/delete.
-- ============================================================================

GRANT SELECT, INSERT, DELETE ON public.endorsements TO authenticated;

CREATE POLICY "endorsements_select"
  ON public.endorsements FOR SELECT TO authenticated
  USING (
    endorser_id = public.get_current_student_id()
    OR endorsee_id = public.get_current_student_id()
    OR public.get_current_user_role() = 'platform_admin'
    OR EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = endorsements.endorsee_id
      AND s.profile_visibility = 'public'
    )
  );

CREATE POLICY "endorsements_insert_endorser"
  ON public.endorsements FOR INSERT TO authenticated
  WITH CHECK (endorser_id = public.get_current_student_id());

CREATE POLICY "endorsements_delete_endorser"
  ON public.endorsements FOR DELETE TO authenticated
  USING (endorser_id = public.get_current_student_id());


-- ============================================================================
-- SECTION 25: RELATIONSHIPS TABLE POLICIES
-- ============================================================================
-- Both participants can see their relationships.
-- Only the source user can create/delete.
-- ============================================================================

GRANT SELECT, INSERT, DELETE ON public.relationships TO authenticated;

CREATE POLICY "relationships_select"
  ON public.relationships FOR SELECT TO authenticated
  USING (
    source_user_id = public.get_current_user_id()
    OR target_user_id = public.get_current_user_id()
    OR public.get_current_user_role() = 'platform_admin'
  );

CREATE POLICY "relationships_insert_source"
  ON public.relationships FOR INSERT TO authenticated
  WITH CHECK (source_user_id = public.get_current_user_id());

CREATE POLICY "relationships_delete_source"
  ON public.relationships FOR DELETE TO authenticated
  USING (source_user_id = public.get_current_user_id());


-- ============================================================================
-- SECTION 26: GRANT SEQUENCE USAGE
-- ============================================================================
-- The skills table uses an auto-increment PK (serial). The authenticated role
-- needs USAGE on its sequence for any INSERT (even though only service_role
-- should INSERT into skills, this prevents runtime errors if a policy is
-- added later).
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class
    WHERE relkind = 'S' AND relname = 'skills_id_seq'
  ) THEN
    EXECUTE 'GRANT USAGE ON SEQUENCE public.skills_id_seq TO authenticated';
  END IF;
END $$;


COMMIT;
