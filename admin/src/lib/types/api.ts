// ── Common ─────────────────────────────────────
export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ── User / Student ────────────────────────────
export interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  status: string;
  institution_id: string;
}

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  enrollment_number: string | null;
  program: string | null;
  academic_year: string | null;
  department: string | null;
  user_type: string;
  status: string;
  email_verified: boolean;
  verified_at: string | null;
  profile_visible: boolean;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  institution_id: string;
  created_at: string;
}

// ── Credential ────────────────────────────────
export interface Credential {
  id: string;
  institution_id: string;
  student_id: string;
  category: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  current_version: number;
  payload_hash: string;
  signature: string;
  signing_key_id: string;
  status: string;
  issued_at: string;
  expires_at: string | null;
  issued_by: string;
  is_public: boolean;
  created_at: string;
}

// ── Audit Log ─────────────────────────────────
export interface AuditLog {
  id: string;
  action: string;
  actor_id: string | null;
  actor_name: string | null;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ── Key ───────────────────────────────────────
export interface SigningKey {
  key_id: string;
  algorithm: string;
  fingerprint: string;
  status: string;
  public_key_pem: string;
  created_at: string;
}

// ── Dashboard ─────────────────────────────────
export interface DashboardStats {
  total_students: number;
  verified_students: number;
  pending_students: number;
  total_credentials: number;
  active_credentials: number;
}

// ── Auth ──────────────────────────────────────
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
