export const USER_STATUSES = [
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "APPEAL_SUBMITTED",
  "FINAL_REJECTED",
  "SUSPENDED",
  "BLACKLISTED",
] as const;

export const CREDENTIAL_CATEGORIES = [
  "ACADEMIC",
  "INTERNSHIP",
  "EVENT",
  "CLUB",
  "RESEARCH",
] as const;

export const ROLES = [
  "SUPER_ADMIN",
  "VERIFICATION_OFFICER",
  "CREDENTIAL_OFFICER",
  "VIEWER",
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];
export type CredentialCategory = (typeof CREDENTIAL_CATEGORIES)[number];
export type Role = (typeof ROLES)[number];
