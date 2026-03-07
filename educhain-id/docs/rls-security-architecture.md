# EduChain — Supabase RLS Security Architecture

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Table-by-Table Policy Design](#2-table-by-table-policy-design)
3. [Migration Execution Guide](#3-migration-execution-guide)
4. [Security Verification Checklist](#4-security-verification-checklist)
5. [Threat Mitigation Matrix](#5-threat-mitigation-matrix)

---

## 1. Security Architecture Overview

### Access Model

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer            │ Role             │ RLS Behavior             │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Client  │ anon             │ Public read only         │
│  Supabase Client  │ authenticated    │ Policy-gated per role    │
│  Fastify Backend  │ service_role     │ Bypasses RLS             │
│  Prisma CLI       │ postgres         │ Bypasses RLS             │
└─────────────────────────────────────────────────────────────────┘
```

### Application Roles

| Role               | Description                          | DB Access Level               |
|--------------------|--------------------------------------|-------------------------------|
| `student`          | Academic identity owner              | Own data + visibility-gated   |
| `institution_admin`| Institution credential authority     | Own institution data          |
| `recruiter`        | Talent discovery agent               | Public/recruiter profiles     |
| `platform_admin`   | Super administrator                  | Full read, policy-gated write |
| `service_role`     | Fastify API backend                  | Full access (bypasses RLS)    |

### Auth Mapping Chain

```
Supabase JWT → auth.jwt() ->> 'email'
                    ↓
            public.users.email (unique index)
                    ↓
         get_current_user_id()    → users.id
         get_current_user_role()  → users.role
         get_current_student_id() → students.id
         get_current_recruiter_id() → recruiters.id
         get_admin_institution_id() → institutions.id
```

All helper functions are `SECURITY DEFINER` + `STABLE` + `SET search_path = public`:
- **SECURITY DEFINER**: Runs as `postgres` owner, bypassing RLS for internal lookups
- **STABLE**: Cached within a single SQL statement — evaluated once, not per-row
- **SET search_path**: Prevents search_path injection attacks (CWE-426)

### Privacy Visibility Model

Student profiles implement three-tier visibility:

| Visibility       | anon | student | recruiter | institution_admin | platform_admin |
|------------------|------|---------|-----------|-------------------|----------------|
| `public`         | ✅   | ✅      | ✅        | ✅                | ✅             |
| `recruiter_only` | ❌   | ❌      | ✅        | ✅                | ✅             |
| `private`        | ❌   | ❌      | ❌        | ❌                | ✅             |

> Owner always sees their own profile regardless of visibility setting.

---

## 2. Table-by-Table Policy Design

### Legend
- **S** = SELECT, **I** = INSERT, **U** = UPDATE, **D** = DELETE
- 🔒 = Locked (no policy), 🌐 = Public, 👤 = Own, 👥 = Visibility-gated, 🏛️ = Institution-scoped

---

### `users` — Core Identity
| Operation | anon | student | recruiter | institution_admin | platform_admin |
|-----------|------|---------|-----------|-------------------|----------------|
| S         | 🔒   | 👤 own  | 👤 own    | 👤 own            | 🌐 all        |
| U         | 🔒   | 👤 own  | 👤 own    | 👤 own            | 👤 own        |
| I/D       | 🔒   | 🔒      | 🔒        | 🔒                | 🔒 (backend)  |

**Column security**: `password_hash` is REVOKED from all client roles.

---

### `refresh_tokens` — Session Secrets
| Operation | anon | authenticated | service_role |
|-----------|------|---------------|--------------|
| S/I/U/D   | 🔒   | 🔒            | ✅           |

**Fully locked**: `REVOKE ALL` + RLS + zero policies.

---

### `audit_logs` — Compliance Trail
| Operation | anon | authenticated | service_role |
|-----------|------|---------------|--------------|
| S/I/U/D   | 🔒   | 🔒            | ✅           |

**Fully locked**: Same as refresh_tokens.

---

### `institutions` — Credential Authorities
| Operation | anon   | student | recruiter | institution_admin  | platform_admin |
|-----------|--------|---------|-----------|-------------------|----------------|
| S         | 🌐 all | 🌐 all  | 🌐 all    | 🌐 all            | 🌐 all        |
| I         | 🔒     | 🔒      | 🔒        | 🔒                | ✅             |
| U         | 🔒     | 🔒      | 🔒        | 🏛️ own institution | ✅             |

**Column security**: `private_key_ref` is REVOKED from all client roles.

---

### `students` — Academic Profiles
| Operation | anon         | student         | recruiter              | institution_admin        | platform_admin |
|-----------|-------------|-----------------|------------------------|--------------------------|----------------|
| S         | 👥 public   | 👤 own + public | 👥 public+recruiter    | 🏛️ own inst + public    | 🌐 all        |
| I         | 🔒          | 👤 own          | 🔒                     | 🔒                       | 🔒 (backend)  |
| U         | 🔒          | 👤 own          | 🔒                     | 🔒                       | 🔒 (backend)  |

---

### `student_skills` — Skill Associations
| Operation | anon       | student         | recruiter           | platform_admin |
|-----------|-----------|-----------------|---------------------|----------------|
| S         | 👥 public | 👤 own + public | 👥 public+recruiter | 🌐 all        |
| I         | 🔒        | 👤 own          | 🔒                  | 🔒            |
| D         | 🔒        | 👤 own          | 🔒                  | 🔒            |

---

### `skills` — Public Catalog
| Operation | anon   | authenticated |
|-----------|--------|---------------|
| S         | 🌐 all | 🌐 all       |
| I/U/D     | 🔒     | 🔒 (backend) |

---

### `projects` — Student Portfolio
Same visibility model as `student_skills`. Owner has full CRUD.

### `achievements` — Student Accomplishments
Same visibility model as `projects`. Owner has full CRUD.

---

### `student_verifications` — Identity Verification Queue
| Operation | student    | institution_admin    | platform_admin |
|-----------|-----------|---------------------|----------------|
| S         | 👤 own    | 🏛️ own institution | 🌐 all        |
| I         | 👤 own    | 🔒                  | 🔒            |
| U         | 🔒        | 🏛️ own institution | ✅             |

---

### `credentials` — Verifiable Academic Records
| Operation | anon   | student | institution_admin    | platform_admin |
|-----------|--------|---------|---------------------|----------------|
| S         | 🌐 all | 🌐 all  | 🌐 all             | 🌐 all        |
| I         | 🔒     | 🔒      | 🏛️ own institution | ✅             |
| U         | 🔒     | 🔒      | 🏛️ own institution | ✅             |
| D         | 🔒     | 🔒      | 🔒                  | 🔒 (never)    |

> Credentials are immutable. Revocation changes the `status` field via UPDATE.

---

### `follows` — Social Graph
| Operation | student                    |
|-----------|---------------------------|
| S         | 👤 follower or following   |
| I         | 👤 as follower only        |
| D         | 👤 as follower only        |

---

### `collaboration_requests` — Collaboration
| Operation | student                    |
|-----------|---------------------------|
| S         | 👤 sender or receiver      |
| I         | 👤 as sender only          |
| U         | 👤 as receiver only        |

---

### `groups` — Study/Project Groups
| Operation | student          |
|-----------|-----------------|
| S         | 👥 members only  |
| I         | 👤 as creator    |
| U/D       | 👤 creator only  |

### `group_members` — Group Roster
| Operation | student                    |
|-----------|---------------------------|
| S         | 👥 co-members              |
| I         | 👤 group owner only        |
| D         | 👤 owner or self-remove    |

---

### `notifications` — User Alerts
| Operation | authenticated |
|-----------|---------------|
| S         | 👤 own only   |
| U         | 👤 own only   |
| I/D       | 🔒 (backend)  |

### `activity_logs` — Student Activity
| Operation | student     | platform_admin |
|-----------|------------|----------------|
| S         | 👤 own     | 🌐 all        |
| I/U/D     | 🔒 (backend) | 🔒 (backend) |

---

### `recruiters` — Recruiter Profiles
| Operation | student | recruiter | platform_admin |
|-----------|---------|-----------|----------------|
| S         | 🌐 all  | 👤 own    | 🌐 all        |
| I         | 🔒      | 👤 own    | 🔒            |
| U         | 🔒      | 👤 own    | 🔒            |

### `shortlists` — Recruiter Bookmarks
| Operation | recruiter |
|-----------|-----------|
| S/I/U/D   | 👤 own only |

---

### `skill_proofs` — Evidence Submissions
Same visibility model as `projects`. Owner has full CRUD.

### `endorsements` — Peer Endorsements
| Operation | student                        |
|-----------|-------------------------------|
| S         | 👤 endorser/endorsee + public |
| I         | 👤 as endorser                |
| D         | 👤 as endorser                |

### `relationships` — Reputation Graph
| Operation | authenticated              |
|-----------|---------------------------|
| S         | 👤 source or target        |
| I         | 👤 as source               |
| D         | 👤 as source               |

---

## 3. Migration Execution Guide

### Option A: Supabase SQL Editor (Recommended)

1. Open your Supabase project → **SQL Editor**
2. Copy the entire contents of:
   ```
   apps/api/prisma/migrations/rls_security_policies/migration.sql
   ```
3. Paste into the editor
4. Click **Run**
5. Verify: No errors should appear. The script is wrapped in a transaction (`BEGIN`/`COMMIT`), so any failure rolls back all changes.

### Option B: Prisma Migrate

```bash
cd apps/api
npx prisma migrate deploy
```

This will apply the migration as part of the normal Prisma workflow.

### Option C: Direct psql

```bash
psql "$DATABASE_URL" -f prisma/migrations/rls_security_policies/migration.sql
```

---

## 4. Security Verification Checklist

Run these queries in the Supabase SQL Editor after applying the migration.

### 4.1 Verify RLS is enabled on ALL tables

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE '_prisma%'
ORDER BY tablename;
```

**Expected**: Every row shows `rowsecurity = true`.

### 4.2 Count policies per table

```sql
SELECT
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected counts**:

| Table                    | Policies |
|--------------------------|----------|
| achievements             | 5        |
| collaboration_requests   | 3        |
| credentials              | 4        |
| endorsements             | 3        |
| follows                  | 3        |
| group_members            | 3        |
| groups                   | 4        |
| institutions             | 4        |
| notifications            | 2        |
| projects                 | 5        |
| recruiters               | 3        |
| relationships            | 3        |
| shortlists               | 4        |
| skill_proofs             | 6        |
| skills                   | 2        |
| student_skills           | 4        |
| student_verifications    | 3        |
| students                 | 4        |
| users                    | 3        |
| activity_logs            | 1        |
| **refresh_tokens**       | **0**    |
| **audit_logs**           | **0**    |

### 4.3 Verify sensitive tables are fully locked

```sql
-- Should return 0 rows (no grants for anon/authenticated)
SELECT
  grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('refresh_tokens', 'audit_logs')
  AND grantee IN ('anon', 'authenticated');
```

### 4.4 Verify password_hash is hidden

```sql
-- Should NOT include password_hash
SELECT column_name
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND grantee = 'authenticated'
  AND privilege_type = 'SELECT';
```

### 4.5 Verify private_key_ref is hidden

```sql
-- Should NOT include private_key_ref
SELECT column_name
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name = 'institutions'
  AND grantee IN ('anon', 'authenticated')
  AND privilege_type = 'SELECT';
```

### 4.6 Verify helper functions exist

```sql
SELECT
  routine_name,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_current_user_id',
    'get_current_user_role',
    'get_current_student_id',
    'get_current_recruiter_id',
    'get_admin_institution_id',
    'is_group_member'
  );
```

**Expected**: 6 rows, all with `security_type = 'DEFINER'`.

### 4.7 Test anonymous credential verification

```sql
-- Switch to anon role to simulate unauthenticated access
SET ROLE anon;

-- Should succeed — credentials are publicly readable
SELECT id, title, status, credential_hash, signature
FROM credentials
LIMIT 5;

-- Should succeed — institutions are publicly readable
SELECT id, name, domain, public_key
FROM institutions
LIMIT 5;

-- Should FAIL — refresh_tokens are locked
SELECT * FROM refresh_tokens LIMIT 1;
-- Expected: ERROR: permission denied

-- Should return EMPTY — users not visible to anon
SELECT * FROM users LIMIT 1;
-- Expected: 0 rows

RESET ROLE;
```

### 4.8 Supabase Linter Re-check

After applying the migration, navigate to:

**Supabase Dashboard → Database → Linter**

All previously reported errors should be resolved:
- ✅ "RLS disabled on table" → All 22 tables now have RLS enabled
- ✅ "Sensitive data exposed via API" → refresh_tokens and audit_logs fully locked
- ✅ "password_hash accessible" → Column grant revoked

---

## 5. Threat Mitigation Matrix

### How this migration prevents specific attacks:

| Threat                        | Attack Vector                                      | Mitigation                                                  |
|-------------------------------|---------------------------------------------------|-------------------------------------------------------------|
| **Unauthorized data access**  | Supabase anon key used to read all tables          | RLS enabled + policies enforce auth + role checks           |
| **Token leakage**             | PostgREST query on refresh_tokens                  | `REVOKE ALL` + RLS + zero policies = total lockout          |
| **Password hash exposure**    | SELECT on users table via PostgREST                | Column-level REVOKE on `password_hash`                      |
| **Private key theft**         | SELECT on institutions via PostgREST               | Column-level REVOKE on `private_key_ref`                    |
| **Credential tampering**      | UPDATE on credentials table                        | Only institution_admin (own institution) can modify          |
| **Credential deletion**       | DELETE on credentials table                        | No DELETE policy exists — credentials are immutable          |
| **Profile data scraping**     | Enumerate all student profiles                     | Visibility policies: private profiles invisible to scrapers  |
| **Privilege escalation**      | Modify own role in users table                     | UPDATE grant limited to safe columns only (no role column)   |
| **Cross-user data access**    | Read another user's notifications/activity         | `user_id = get_current_user_id()` ownership checks           |
| **Recruiter data modification** | Recruiter modifies student records              | No UPDATE/INSERT on students table for recruiter role        |
| **Audit log tampering**       | Delete or modify audit trail                       | `REVOKE ALL` + RLS + zero policies                          |
| **Group infiltration**        | Read groups without membership                     | `is_group_member()` function enforces membership checks      |
| **Fake endorsements**         | Create endorsements on behalf of others            | `endorser_id = get_current_student_id()` enforced            |
| **Collaboration spoofing**    | Send requests as someone else                      | `sender_id = get_current_student_id()` enforced              |

### Defense-in-Depth Layers

```
Layer 1: Network        → Supabase API gateway + TLS
Layer 2: Authentication → Supabase Auth JWT verification
Layer 3: Row-Level      → RLS policies (this migration)
Layer 4: Column-Level   → REVOKE on sensitive columns
Layer 5: Application    → Fastify middleware (authenticateToken, authorizeRole)
Layer 6: Cryptographic  → RSA-2048 credential signing
```

### Remaining Recommendations (Post-RLS)

1. **Replace email domain matching** for `get_admin_institution_id()` with an explicit `institution_id` FK on the `users` table
2. **Add `FORCE ROW LEVEL SECURITY`** on `refresh_tokens` and `audit_logs` for maximum paranoia (forces RLS even for table owners)
3. **Implement session-level `app.current_user_id`** via `SET` for performance (avoids repeated user lookup per statement)
4. **Add RLS policy tests** using `SET ROLE` in a test harness to verify policies from each role's perspective
5. **Monitor policy performance** via `pg_stat_user_tables` — watch for sequential scans caused by complex policy predicates
