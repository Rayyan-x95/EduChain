export {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  assignRoleSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth';
export type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  AssignRoleInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth';

export {
  createStudentProfileSchema,
  updateStudentProfileSchema,
  requestVerificationSchema,
} from './student';
export type {
  CreateStudentProfileInput,
  UpdateStudentProfileInput,
  RequestVerificationInput,
} from './student';

export { createProjectSchema, updateProjectSchema } from './project';
export type { CreateProjectInput, UpdateProjectInput } from './project';

export { createAchievementSchema, updateAchievementSchema } from './achievement';
export type { CreateAchievementInput, UpdateAchievementInput } from './achievement';

export { addSkillSchema } from './skill';
export type { AddSkillInput } from './skill';

export { issueCredentialSchema, revokeCredentialSchema } from './credential';
export type { IssueCredentialInput, RevokeCredentialInput } from './credential';

export { searchStudentsSchema, skillAutocompleteSchema } from './search';
export type { SearchStudentsInput, SkillAutocompleteInput } from './search';

export {
  followStudentSchema,
  sendCollaborationRequestSchema,
  handleCollaborationRequestSchema,
  createGroupSchema,
  addGroupMemberSchema,
} from './collaboration';
export type {
  FollowStudentInput,
  SendCollaborationRequestInput,
  HandleCollaborationRequestInput,
  CreateGroupInput,
  AddGroupMemberInput,
} from './collaboration';

export {
  createRecruiterProfileSchema,
  updateRecruiterProfileSchema,
  addToShortlistSchema,
  browseStudentsSchema,
} from './recruiter';
export type {
  CreateRecruiterProfileInput,
  UpdateRecruiterProfileInput,
  AddToShortlistInput,
  BrowseStudentsInput,
} from './recruiter';

export { uploadCertificateSchema } from './upload';
export type { UploadCertificateInput } from './upload';

export { setUsernameSchema, updateIdentityVisibilitySchema } from './identity';
export type { SetUsernameInput, UpdateIdentityVisibilityInput } from './identity';

export { submitSkillProofSchema, endorseSkillSchema } from './skill-proof';
export type { SubmitSkillProofInput, EndorseSkillInput } from './skill-proof';

export { createRelationshipSchema } from './relationship';
export type { CreateRelationshipInput } from './relationship';

export { talentSearchSchema } from './talent-search';
export type { TalentSearchInput } from './talent-search';

export { reviewVerificationSchema } from './verification';
export type { ReviewVerificationInput } from './verification';
