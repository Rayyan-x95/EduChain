import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

// The API returns enriched objects with joined relations (e.g. Student + skills,
// Credential + institution name). We type the query layer as `any` at this
// boundary and let pages consume whichever fields the API actually provides.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { ApiResponse } from '@educhain/types';

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: () => apiFetch<ApiResponse<any>>('/students/me').then((r) => r.data!),
  });
}

export function useStudentById(id: string) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => apiFetch<ApiResponse<any>>(`/students/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<ApiResponse<any>>('/students/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', 'profile'] }),
  });
}

export function useProfileCompletion() {
  return useQuery({
    queryKey: ['student', 'completion'],
    queryFn: () => apiFetch<ApiResponse<any>>('/students/me/completion').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

export function useMyCredentials() {
  return useQuery({
    queryKey: ['credentials', 'mine'],
    queryFn: () => apiFetch<ApiResponse<any>>('/credentials/me').then((r) => r.data!),
  });
}

export function useCredentialById(id: string) {
  return useQuery({
    queryKey: ['credentials', id],
    queryFn: () => apiFetch<ApiResponse<any>>(`/credentials/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function useMyProjects() {
  return useQuery({
    queryKey: ['projects', 'mine'],
    queryFn: () => apiFetch<ApiResponse<any>>('/projects/me').then((r) => r.data!),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; repoLink?: string }) =>
      apiFetch<ApiResponse<any>>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export function useMyAchievements() {
  return useQuery({
    queryKey: ['achievements', 'mine'],
    queryFn: () => apiFetch<ApiResponse<any>>('/achievements/me').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export function useMySkills() {
  return useQuery({
    queryKey: ['skills', 'mine'],
    queryFn: () =>
      apiFetch<ApiResponse<any>>('/skills/me').then((r) => r.data!),
  });
}

export function useAllSkills() {
  return useQuery({
    queryKey: ['skills', 'all'],
    queryFn: () => apiFetch<ApiResponse<any>>('/skills').then((r) => r.data!),
  });
}

export function useAddSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<ApiResponse<any>>('/skills/me', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] });
      qc.invalidateQueries({ queryKey: ['student', 'profile'] });
    },
  });
}

export function useRemoveSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillId: number | string) =>
      apiFetch<ApiResponse<any>>(`/skills/me/${skillId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] });
      qc.invalidateQueries({ queryKey: ['student', 'profile'] });
    },
  });
}

export function useSkillAutocomplete(query: string) {
  return useQuery({
    queryKey: ['skills', 'autocomplete', query],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/search/skills?q=${encodeURIComponent(query)}`).then((r) => r.data!),
    enabled: query.length >= 2,
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(
        `/notifications?page=${page}`,
      ).then((r) => r.data!),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<ApiResponse<any>>(`/notifications/${id}`, { method: 'PUT' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ---------------------------------------------------------------------------
// Collaborations
// ---------------------------------------------------------------------------

export function useCollaborationRequests(type: 'incoming' | 'outgoing') {
  return useQuery({
    queryKey: ['collaborations', type],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/collaborations/${type}`).then((r) => r.data!),
  });
}

export function useActiveCollaborators() {
  return useQuery({
    queryKey: ['collaborations', 'active'],
    queryFn: () =>
      apiFetch<ApiResponse<any>>('/collaborations/active').then((r) => r.data!),
  });
}

export function useSendCollaboration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { receiverId: string; message?: string }) =>
      apiFetch<ApiResponse<any>>('/collaborations/request', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: data.receiverId,
          message: data.message,
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collaborations'] }),
  });
}

export function useHandleCollaboration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; decision: 'accepted' | 'rejected' }) =>
      apiFetch<ApiResponse<any>>(`/collaborations/${data.id}/${data.decision === 'accepted' ? 'accept' : 'reject'}`, {
        method: 'POST',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collaborations'] }),
  });
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export function useGroupById(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/groups/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

export function useMyGroups() {
  return useQuery({
    queryKey: ['groups', 'mine'],
    queryFn: () =>
      apiFetch<ApiResponse<any>>('/groups').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export function useSearchStudents(params: {
  q?: string;
  skills?: string[];
  institution?: string;
  graduationYear?: number;
  verifiedOnly?: boolean;
  cursor?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.skills?.length) searchParams.set('skills', params.skills.join(','));
  if (params.institution) searchParams.set('institution', params.institution);
  if (params.graduationYear) searchParams.set('graduation_year', String(params.graduationYear));
  if (params.verifiedOnly) searchParams.set('verified_only', 'true');
  if (params.cursor) searchParams.set('cursor', params.cursor);

  return useQuery({
    queryKey: ['search', 'students', params],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/search/students?${searchParams.toString()}`).then(
        (r) => r.data!,
      ),
  });
}

// ---------------------------------------------------------------------------
// Recruiter
// ---------------------------------------------------------------------------

export function useRecruiterProfile() {
  return useQuery({
    queryKey: ['recruiter', 'profile'],
    queryFn: () => apiFetch<ApiResponse<any>>('/recruiters/me').then((r) => r.data!),
  });
}

export function useCreateRecruiterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { companyName: string; position?: string; bio?: string }) =>
      apiFetch<ApiResponse<any>>('/recruiters/me', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiter'] }),
  });
}

export function useUpdateRecruiterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { companyName?: string; position?: string; bio?: string }) =>
      apiFetch<ApiResponse<any>>('/recruiters/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiter'] }),
  });
}

export function useRecruiterStudentProfile(id: string) {
  return useQuery({
    queryKey: ['recruiter', 'student', id],
    queryFn: () => apiFetch<ApiResponse<any>>(`/recruiters/profile/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

export function useShortlist() {
  return useQuery({
    queryKey: ['recruiter', 'shortlist'],
    queryFn: () =>
      apiFetch<ApiResponse<any>>('/recruiters/shortlist').then((r) => r.data!),
  });
}

export function useAddToShortlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentId: string; note?: string }) =>
      apiFetch<ApiResponse<any>>('/recruiters/shortlist', {
        method: 'POST',
        body: JSON.stringify({
          student_id: data.studentId,
          note: data.note,
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiter', 'shortlist'] }),
  });
}

export function useRemoveFromShortlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      apiFetch<ApiResponse<any>>(`/recruiters/shortlist/${studentId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiter', 'shortlist'] }),
  });
}

// ---------------------------------------------------------------------------
// Verifications (Institution admin)
// ---------------------------------------------------------------------------

export function useVerificationsByInstitution(institutionId: string, status?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  return useQuery({
    queryKey: ['verifications', institutionId, status],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(
        `/verifications/institution/${institutionId}?${params.toString()}`,
      ).then((r) => r.data!),
    enabled: !!institutionId,
  });
}

export function useReviewVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { verificationId: string; decision: 'approved' | 'rejected' }) =>
      apiFetch<ApiResponse<any>>(`/verifications/${data.verificationId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ decision: data.decision }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verifications'] }),
  });
}

export function useInstitutionVerifications(status?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  return useQuery({
    queryKey: ['verifications', 'institution', 'me', status],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/verifications/institution/me?${params.toString()}`).then(
        (r) => r.data!,
      ),
  });
}

// ---------------------------------------------------------------------------
// Institution Credentials
// ---------------------------------------------------------------------------

export function useInstitutionCredentials() {
  return useQuery({
    queryKey: ['institution', 'credentials'],
    queryFn: () =>
      apiFetch<ApiResponse<any>>('/credentials').then((r) => r.data!),
  });
}

export function useGenerateInstitutionKeys() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (institutionId: string) =>
      apiFetch<ApiResponse<any>>(`/credentials/institutions/${institutionId}/keys`, {
        method: 'POST',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institution'] }),
  });
}

export function useRotateInstitutionKeys() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (institutionId: string) =>
      apiFetch<ApiResponse<any>>(`/credentials/institutions/${institutionId}/keys/rotate`, {
        method: 'POST',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institution'] }),
  });
}

export function useIssueCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      studentId?: string;
      studentEmail?: string;
      credentialType: string;
      title: string;
      description?: string;
      issuedDate?: string;
    }) =>
      apiFetch<ApiResponse<any>>('/credentials/issue', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          issuedDate: data.issuedDate ?? new Date().toISOString().slice(0, 10),
        }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institution', 'credentials'] }),
  });
}

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

export function useStudentStats() {
  return useQuery({
    queryKey: ['student', 'stats'],
    queryFn: () =>
      apiFetch<ApiResponse<any>>('/students/me/stats').then((r) => r.data!),
  });
}

export function useInstitutionStats() {
  return useQuery({
    queryKey: ['institution', 'stats'],
    queryFn: () =>
      apiFetch<ApiResponse<any>>('/students/stats').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export function useActivityFeed() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(
        '/collaborations/activity',
      ).then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export function useSetUsername() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) =>
      apiFetch<ApiResponse<any>>('/identity/username', {
        method: 'PUT',
        body: JSON.stringify({ username }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', 'profile'] }),
  });
}

export function useUpdateIdentityVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visibility: string) =>
      apiFetch<ApiResponse<any>>('/identity/visibility', {
        method: 'PUT',
        body: JSON.stringify({ visibility }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', 'profile'] }),
  });
}

// ---------------------------------------------------------------------------
// GDPR
// ---------------------------------------------------------------------------

export function useRequestAccountDeletion() {
  return useMutation({
    mutationFn: (data: { confirmEmail: string; reason?: string }) =>
      apiFetch<ApiResponse<any>>('/gdpr/delete-account', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useCancelAccountDeletion() {
  return useMutation({
    mutationFn: () =>
      apiFetch<ApiResponse<any>>('/gdpr/cancel-deletion', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
  });
}

export function useRecordConsent() {
  return useMutation({
    mutationFn: (data: { consentType: string; granted: boolean }) =>
      apiFetch<ApiResponse<any>>('/gdpr/consent', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function usePublicIdentity(slug: string) {
  return useQuery({
    queryKey: ['identity', slug],
    queryFn: () => apiFetch<ApiResponse<any>>(`/identity/${slug}`).then((r) => r.data!),
    enabled: !!slug,
  });
}

// ---------------------------------------------------------------------------
// Skill Proofs & Endorsements
// ---------------------------------------------------------------------------

export function useSubmitSkillProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      skillName: string;
      proofType: string;
      referenceUrl?: string;
      description?: string;
    }) =>
      apiFetch<ApiResponse<any>>('/skill-proofs/proofs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skill-proofs'] }),
  });
}

export function useMySkillProofs() {
  return useQuery({
    queryKey: ['skill-proofs', 'mine'],
    queryFn: () => apiFetch<ApiResponse<any>>('/skill-proofs/proofs/me').then((r) => r.data!),
  });
}

export function useEndorseSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { endorseeId: string; skillId: number; message?: string }) =>
      apiFetch<ApiResponse<any>>('/skill-proofs/endorsements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['endorsements'] }),
  });
}

export function useMyEndorsements() {
  return useQuery({
    queryKey: ['endorsements', 'mine'],
    queryFn: () => apiFetch<ApiResponse<any>>('/skill-proofs/endorsements/me').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

export function useCreateRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { targetUserId: string; relationshipType: string }) =>
      apiFetch<ApiResponse<any>>('/relationships', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relationships'] }),
  });
}

export function useMyRelationships() {
  return useQuery({
    queryKey: ['relationships', 'mine'],
    queryFn: () => apiFetch<ApiResponse<any>>('/relationships/me').then((r) => r.data!),
  });
}

export function useReputationGraph(userId: string) {
  return useQuery({
    queryKey: ['relationships', 'graph', userId],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/relationships/graph/${userId}`).then((r) => r.data!),
    enabled: !!userId,
  });
}

// ---------------------------------------------------------------------------
// Talent Search (Recruiter)
// ---------------------------------------------------------------------------

export function useTalentSearch(params: {
  skills?: string;
  institution?: string;
  graduation_year?: number;
  min_score?: number;
  page?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.skills) searchParams.set('skills', params.skills);
  if (params.institution) searchParams.set('institution', params.institution);
  if (params.graduation_year) searchParams.set('graduation_year', String(params.graduation_year));
  if (params.min_score) searchParams.set('min_score', String(params.min_score));
  if (params.page) searchParams.set('page', String(params.page));

  return useQuery({
    queryKey: ['talent-search', params],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/talent-search?${searchParams.toString()}`).then(
        (r) => r.data!,
      ),
  });
}

// ---------------------------------------------------------------------------
// QR Verification (Public)
// ---------------------------------------------------------------------------

export function useVerifyStudent(studentId: string) {
  return useQuery({
    queryKey: ['verify', studentId],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/verify/${studentId}`).then((r) => r.data!),
    enabled: !!studentId,
  });
}

// ---------------------------------------------------------------------------
// Auth: Forgot & Reset Password
// ---------------------------------------------------------------------------

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<ApiResponse<any>>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      apiFetch<ApiResponse<any>>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

// ---------------------------------------------------------------------------
// Identity: Share Links & DID
// ---------------------------------------------------------------------------

export function useCreateShareLink() {
  return useMutation({
    mutationFn: (data: { credentialId: string; expiresInHours?: number }) =>
      apiFetch<ApiResponse<any>>('/identity/share', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useDIDDocument(slug: string) {
  return useQuery({
    queryKey: ['identity', 'did', slug],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/identity/${slug}/did.json`).then((r) => r.data ?? r),
    enabled: !!slug,
  });
}

// ---------------------------------------------------------------------------
// Credential Verification (Public)
// ---------------------------------------------------------------------------

export function useVerifyCredential(credentialId: string) {
  return useQuery({
    queryKey: ['credential', 'verify', credentialId],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/credentials/verify/${credentialId}`).then((r) => r.data!),
    enabled: !!credentialId,
  });
}

export function useVerifyStudentIdentity(studentId: string) {
  return useQuery({
    queryKey: ['student', 'verify', studentId],
    queryFn: () => apiFetch<ApiResponse<any>>(`/verify/${studentId}`).then((r) => r.data!),
    enabled: !!studentId,
  });
}

// ---------------------------------------------------------------------------
// Student Verification Request
// ---------------------------------------------------------------------------

export function useRequestVerification() {
  return useMutation({
    mutationFn: (data: {
      institutionId: string;
      studentEmail: string;
      studentIdNumber: string;
    }) =>
      apiFetch<ApiResponse<any>>('/verifications', {
        method: 'POST',
        body: JSON.stringify({
          institutionId: data.institutionId,
          studentEmail: data.studentEmail,
          studentIdNumber: data.studentIdNumber,
        }),
      }),
  });
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; visibility?: string; tags?: string[] }) =>
      apiFetch<ApiResponse<any>>('/groups', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

// ---------------------------------------------------------------------------
// Institution Autocomplete
// ---------------------------------------------------------------------------

export function useInstitutionAutocomplete(query?: string) {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  return useQuery({
    queryKey: ['institutions', 'autocomplete', query ?? ''],
    queryFn: () =>
      apiFetch<ApiResponse<any>>(`/search/institutions${params}`).then((r) => r.data!),
  });
}
