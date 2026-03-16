export const UserRole = {
  STUDENT: 'student',
  INSTITUTION_ADMIN: 'institution_admin',
  RECRUITER: 'recruiter',
  PLATFORM_ADMIN: 'platform_admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// Phase 2: Student Identity types
// ---------------------------------------------------------------------------

export const ProfileVisibility = {
  PUBLIC: 'public',
  RECRUITER_ONLY: 'recruiter_only',
  PRIVATE: 'private',
} as const;

export type ProfileVisibility =
  (typeof ProfileVisibility)[keyof typeof ProfileVisibility];

export const VerificationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export interface Institution {
  id: string;
  name: string;
  domain: string;
  verificationStatus: boolean;
  publicKey?: string | null;
  createdAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  fullName: string;
  institutionId?: string | null;
  degree?: string | null;
  graduationYear?: number | null;
  bio?: string | null;
  profileVisibility: ProfileVisibility;
  createdAt: Date;
}

export interface Skill {
  id: number;
  name: string;
}

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description?: string | null;
  repoLink?: string | null;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description?: string | null;
  issuedBy?: string | null;
  date?: Date | null;
}

export interface StudentVerification {
  id: string;
  studentId: string;
  institutionId: string;
  studentEmail: string;
  studentIdNumber: string;
  status: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Phase 3: Credential Issuing & Verification types
// ---------------------------------------------------------------------------

export const CredentialStatus = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
} as const;

export type CredentialStatus =
  (typeof CredentialStatus)[keyof typeof CredentialStatus];

export interface Credential {
  id: string;
  studentId: string;
  institutionId: string;
  credentialType: string;
  title: string;
  description?: string | null;
  issuedDate: Date;
  credentialHash?: string | null;
  signature?: string | null;
  status: CredentialStatus;
  certificateUrl?: string | null;
  createdAt: Date;
}

export interface CredentialVerificationResult {
  verified: boolean;
  credential?: {
    id: string;
    title: string;
    credentialType: string;
    issuedDate: Date;
    status: CredentialStatus;
  };
  institution?: {
    id: string;
    name: string;
    domain: string;
  };
  reason?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export const AuditAction = {
  CREDENTIAL_ISSUED: 'credential_issued',
  CREDENTIAL_REVOKED: 'credential_revoked',
  CREDENTIAL_SIGNED: 'credential_signed',
  STUDENT_VERIFIED: 'student_verified',
  INSTITUTION_REGISTERED: 'institution_registered',
  INSTITUTION_KEYS_GENERATED: 'institution_keys_generated',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// ---------------------------------------------------------------------------
// Phase 4: Search & Discovery types
// ---------------------------------------------------------------------------

export const SearchSort = {
  RECENT: 'recent',
  GRADUATION_YEAR: 'graduation_year',
  PROFILE_POPULARITY: 'profile_popularity',
} as const;

export type SearchSort = (typeof SearchSort)[keyof typeof SearchSort];

export interface StudentSearchResult {
  student_id: string;
  full_name: string;
  institution: string | null;
  degree: string | null;
  graduation_year: number | null;
  top_skills: string[];
  verified_credential_count: number;
  profile_visibility: ProfileVisibility;
}

export interface SearchResponse {
  results: StudentSearchResult[];
  next_cursor: string | null;
  total: number;
}

export interface SkillAutocompleteResult {
  id: number;
  name: string;
}

// ---------------------------------------------------------------------------
// Phase 5: Collaboration & Social Layer types
// ---------------------------------------------------------------------------

export const CollaborationRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export type CollaborationRequestStatus =
  (typeof CollaborationRequestStatus)[keyof typeof CollaborationRequestStatus];

export const GroupRole = {
  OWNER: 'owner',
  MEMBER: 'member',
} as const;

export type GroupRole = (typeof GroupRole)[keyof typeof GroupRole];

export const NotificationType = {
  COLLABORATION_REQUEST: 'collaboration_request',
  COLLABORATION_ACCEPTED: 'collaboration_accepted',
  NEW_FOLLOWER: 'new_follower',
  CREDENTIAL_ISSUED: 'credential_issued',
  GROUP_INVITATION: 'group_invitation',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const ActivityAction = {
  STUDENT_FOLLOWED: 'student_followed',
  COLLABORATION_REQUESTED: 'collaboration_requested',
  GROUP_CREATED: 'group_created',
  CREDENTIAL_ADDED: 'credential_added',
} as const;

export type ActivityAction =
  (typeof ActivityAction)[keyof typeof ActivityAction];

export interface FollowRelation {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface CollaborationRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string | null;
  status: CollaborationRequestStatus;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface GroupMember {
  groupId: string;
  studentId: string;
  role: GroupRole;
  joinedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  read: boolean;
  createdAt: Date;
}

export interface ActivityLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Phase 8: Verifiable Identity Platform types
// ---------------------------------------------------------------------------

export const IdentityVisibility = {
  PUBLIC: 'public',
  CONNECTIONS_ONLY: 'connections_only',
  PRIVATE: 'private',
} as const;

export type IdentityVisibility =
  (typeof IdentityVisibility)[keyof typeof IdentityVisibility];

export const ProofType = {
  GITHUB_REPOSITORY: 'github_repository',
  HACKATHON_CERTIFICATE: 'hackathon_certificate',
  COURSE_COMPLETION: 'course_completion',
  PEER_ENDORSEMENT: 'peer_endorsement',
  PROJECT_CONTRIBUTION: 'project_contribution',
} as const;

export type ProofType = (typeof ProofType)[keyof typeof ProofType];

export const ProofVerificationStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type ProofVerificationStatus =
  (typeof ProofVerificationStatus)[keyof typeof ProofVerificationStatus];

export const RelationshipType = {
  COLLABORATED_WITH: 'collaborated_with',
  ENDORSED_BY: 'endorsed_by',
  MENTOR_OF: 'mentor_of',
  WORKED_WITH: 'worked_with',
} as const;

export type RelationshipType =
  (typeof RelationshipType)[keyof typeof RelationshipType];

export interface SkillProof {
  id: string;
  studentId: string;
  skillId: number;
  proofType: ProofType;
  referenceUrl?: string | null;
  description?: string | null;
  verificationStatus: ProofVerificationStatus;
  verificationScore: number;
  createdAt: Date;
}

export interface Endorsement {
  id: string;
  endorserId: string;
  endorseeId: string;
  skillId: number;
  message?: string | null;
  createdAt: Date;
}

export interface Relationship {
  id: string;
  sourceUserId: string;
  targetUserId: string;
  relationshipType: RelationshipType;
  createdAt: Date;
}

export interface PublicIdentityProfile {
  userId: string;
  username: string;
  slug: string;
  fullName: string;
  bio?: string | null;
  institution?: string | null;
  institutionVerified?: boolean;
  degree?: string | null;
  graduationYear?: number | null;
  skills: string[];
  verifiedCredentialCount: number;
  endorsementCount: number;
  relationshipCount: number;
  credentials?: Array<{
    id: string;
    title: string;
    credentialType: string;
    issuedDate: Date;
    institutionName: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description?: string | null;
    repoLink?: string | null;
    createdAt: Date;
  }>;
}

export interface TalentSearchResult {
  studentId: string;
  fullName: string;
  institution: string | null;
  degree: string | null;
  graduationYear: number | null;
  topSkills: string[];
  verifiedCredentialCount: number;
  endorsementCount: number;
  talentScore: number;
}

export interface TalentSearchResponse {
  results: TalentSearchResult[];
  total: number;
  page: number;
  limit: number;
}

export interface QRVerificationResult {
  verified: boolean;
  identity?: PublicIdentityProfile;
  credentials?: Array<{
    id: string;
    title: string;
    credentialType: string;
    issuedDate: Date;
    status: CredentialStatus;
    institutionName: string;
    signatureValid: boolean;
  }>;
  verifiedAt: string;
}

// ---------------------------------------------------------------------------
// Phase 6: Recruiter Portal & Talent Discovery types
// ---------------------------------------------------------------------------

export interface Recruiter {
  id: string;
  userId: string;
  companyName: string;
  position?: string | null;
  bio?: string | null;
  createdAt: Date;
}

export interface ShortlistEntry {
  recruiterId: string;
  studentId: string;
  note?: string | null;
  createdAt: Date;
}

export interface RecruiterStudentView {
  student_id: string;
  full_name: string;
  institution: string | null;
  degree: string | null;
  graduation_year: number | null;
  top_skills: string[];
  verified_credential_count: number;
  bio: string | null;
}

// ---------------------------------------------------------------------------
// W3C Verifiable Credentials & DID Infrastructure
// ---------------------------------------------------------------------------

/** W3C DID Document (did:web / did:key) */
export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: DIDVerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  service?: DIDService[];
}

export interface DIDVerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk?: JsonWebKey;
  publicKeyMultibase?: string;
}

export interface DIDService {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface JsonWebKey {
  kty: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
}

/** W3C Verifiable Credential (JSON-LD format) */
export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: VCIssuer;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: VCCredentialSubject;
  credentialStatus?: VCCredentialStatus;
  credentialSchema?: VCCredentialSchema;
  evidence?: VCEvidence[];
  proof?: VCProof;
}

export interface VCIssuer {
  id: string;
  name: string;
  url?: string;
}

export interface VCCredentialSubject {
  id: string;
  name?: string;
  achievement?: VCAchievement;
}

export interface VCAchievement {
  type: string;
  name: string;
  description?: string;
  criteria?: string;
  image?: string;
}

export interface VCCredentialStatus {
  id: string;
  type: 'RevocationList2020Status' | 'StatusList2021Entry';
  statusListIndex?: string;
  statusListCredential?: string;
}

export interface VCCredentialSchema {
  id: string;
  type: string;
}

export interface VCEvidence {
  id: string;
  type: string[];
  verifier?: string;
  evidenceDocument?: string;
  subjectPresence?: string;
}

export interface VCProof {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws?: string;
  signatureValue?: string;
}

/** JWT-encoded Verifiable Credential header */
export interface JWTVCHeader {
  alg: string;
  typ: 'JWT';
  kid: string;
}

/** JWT-encoded Verifiable Credential payload */
export interface JWTVCPayload {
  iss: string;
  sub: string;
  iat: number;
  exp?: number;
  jti: string;
  vc: Omit<VerifiableCredential, 'proof'>;
}

/** Offline verification payload (self-contained) */
export interface OfflineVerificationPayload {
  credential: VerifiableCredential;
  issuerPublicKey: string;
  revocationStatus: {
    revoked: boolean;
    checkedAt: string;
  };
  verificationInstructions: {
    algorithm: string;
    hashFunction: string;
    steps: string[];
  };
}

/** Credential wallet export formats */
export type CredentialExportFormat = 'json-ld' | 'jwt-vc' | 'pdf-certificate' | 'qr-payload';

export interface CredentialExportRequest {
  credentialId: string;
  format: CredentialExportFormat;
}

export interface CredentialExportResult {
  format: CredentialExportFormat;
  data: string;
  mimeType: string;
  filename: string;
}

/** Institution key registry entry */
export interface InstitutionKeyRegistryEntry {
  institutionId: string;
  institutionName: string;
  publicKey: string;
  keyFingerprint: string;
  algorithm: string;
  createdAt: string;
  rotatedAt?: string;
  status: 'active' | 'rotated' | 'revoked';
}

/** GDPR data export */
export interface GDPRDataExport {
  exportedAt: string;
  userId: string;
  profile: {
    email: string;
    role: string;
    createdAt: string;
    student: {
      id: string;
      fullName: string;
      degree: string | null;
      bio: string | null;
    } | null;
  };
  credentials: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    issuedDate: string;
    institutionId: string;
  }>;
  skills: Array<{
    skillId: number;
    skillName: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    issuer: string;
    dateEarned: string;
  } >;
  auditTrail: Array<{
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
  }>;
}

/** Account deletion request */
export interface AccountDeletionRequest {
  confirmEmail: string;
  reason?: string;
}

