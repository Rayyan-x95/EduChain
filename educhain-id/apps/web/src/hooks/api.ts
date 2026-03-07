import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

// The API returns enriched objects with joined relations (e.g. Student + skills,
// Credential + institution name). We type the query layer as `any` at this
// boundary and let pages consume whichever fields the API actually provides.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiRes<T = any> = { success: boolean; data?: T; error?: string };

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: () => apiFetch<ApiRes>('/students/me').then((r) => r.data!),
  });
}

export function useStudentById(id: string) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => apiFetch<ApiRes>(`/students/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<ApiRes>('/students/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', 'profile'] }),
  });
}

export function useProfileCompletion() {
  return useQuery({
    queryKey: ['student', 'completion'],
    queryFn: () => apiFetch<ApiRes>('/students/me/completion').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

export function useMyCredentials() {
  return useQuery({
    queryKey: ['credentials', 'mine'],
    queryFn: () => apiFetch<ApiRes>('/credentials/me').then((r) => r.data!),
  });
}

export function useCredentialById(id: string) {
  return useQuery({
    queryKey: ['credentials', id],
    queryFn: () => apiFetch<ApiRes>(`/credentials/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function useMyProjects() {
  return useQuery({
    queryKey: ['projects', 'mine'],
    queryFn: () => apiFetch<ApiRes>('/projects/me').then((r) => r.data!),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; repoLink?: string }) =>
      apiFetch<ApiRes>('/projects', {
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
    queryFn: () => apiFetch<ApiRes>('/achievements/me').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export function useMySkills() {
  return useQuery({
    queryKey: ['skills', 'mine'],
    queryFn: () =>
      apiFetch<ApiRes>('/skills/me').then((r) => r.data!),
  });
}

export function useSkillAutocomplete(query: string) {
  return useQuery({
    queryKey: ['skills', 'autocomplete', query],
    queryFn: () =>
      apiFetch<ApiRes>(`/search/skills?q=${encodeURIComponent(query)}`).then((r) => r.data!),
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
      apiFetch<ApiRes>(
        `/notifications?page=${page}`,
      ).then((r) => r.data!),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<ApiRes>(`/notifications/${id}`, { method: 'PUT' }),
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
      apiFetch<ApiRes>(`/collaborations/${type}`).then((r) => r.data!),
  });
}

export function useActiveCollaborators() {
  return useQuery({
    queryKey: ['collaborations', 'active'],
    queryFn: () =>
      apiFetch<ApiRes>('/collaborations/active').then((r) => r.data!),
  });
}

export function useSendCollaboration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { receiverId: string; message?: string }) =>
      apiFetch<ApiRes>('/collaborations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collaborations'] }),
  });
}

export function useHandleCollaboration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; decision: 'accepted' | 'rejected' }) =>
      apiFetch<ApiRes>(`/collaborations/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ decision: data.decision }),
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
      apiFetch<ApiRes>(`/groups/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export function useSearchStudents(params: {
  q?: string;
  skills?: string[];
  institution?: string;
  cursor?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.skills?.length) searchParams.set('skills', params.skills.join(','));
  if (params.institution) searchParams.set('institution', params.institution);
  if (params.cursor) searchParams.set('cursor', params.cursor);

  return useQuery({
    queryKey: ['search', 'students', params],
    queryFn: () =>
      apiFetch<ApiRes>(`/search/students?${searchParams.toString()}`).then(
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
    queryFn: () => apiFetch<ApiRes>('/recruiters/me').then((r) => r.data!),
  });
}

export function useShortlist() {
  return useQuery({
    queryKey: ['recruiter', 'shortlist'],
    queryFn: () =>
      apiFetch<ApiRes>('/recruiters/shortlist').then((r) => r.data!),
  });
}

export function useAddToShortlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentId: string; note?: string }) =>
      apiFetch<ApiRes>('/recruiters/shortlist', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiter', 'shortlist'] }),
  });
}

export function useRemoveFromShortlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      apiFetch<ApiRes>(`/recruiters/shortlist/${studentId}`, { method: 'DELETE' }),
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
      apiFetch<ApiRes>(
        `/verifications/institution/${institutionId}?${params.toString()}`,
      ).then((r) => r.data!),
    enabled: !!institutionId,
  });
}

export function useReviewVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { verificationId: string; decision: 'approved' | 'rejected' }) =>
      apiFetch<ApiRes>(`/verifications/${data.verificationId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ decision: data.decision }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verifications'] }),
  });
}

// ---------------------------------------------------------------------------
// Institution Credentials
// ---------------------------------------------------------------------------

export function useInstitutionCredentials() {
  return useQuery({
    queryKey: ['institution', 'credentials'],
    queryFn: () =>
      apiFetch<ApiRes>('/credentials').then((r) => r.data!),
  });
}

export function useIssueCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      studentId: string;
      credentialType: string;
      title: string;
      description?: string;
    }) =>
      apiFetch<ApiRes>('/credentials', {
        method: 'POST',
        body: JSON.stringify(data),
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
      apiFetch<ApiRes>('/students/me/stats').then((r) => r.data!),
  });
}

export function useInstitutionStats() {
  return useQuery({
    queryKey: ['institution', 'stats'],
    queryFn: () =>
      apiFetch<ApiRes>('/students/stats').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export function useActivityFeed() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: () =>
      apiFetch<ApiRes>(
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
      apiFetch<ApiRes>('/identity/username', {
        method: 'PUT',
        body: JSON.stringify({ username }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', 'profile'] }),
  });
}

export function useUpdateIdentityVisibility() {
  return useMutation({
    mutationFn: (visibility: string) =>
      apiFetch<ApiRes>('/identity/visibility', {
        method: 'PUT',
        body: JSON.stringify({ visibility }),
      }),
  });
}

export function usePublicIdentity(slug: string) {
  return useQuery({
    queryKey: ['identity', slug],
    queryFn: () => apiFetch<ApiRes>(`/identity/${slug}`).then((r) => r.data!),
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
      apiFetch<ApiRes>('/skill-proofs/proofs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skill-proofs'] }),
  });
}

export function useMySkillProofs() {
  return useQuery({
    queryKey: ['skill-proofs', 'mine'],
    queryFn: () => apiFetch<ApiRes>('/skill-proofs/proofs/me').then((r) => r.data!),
  });
}

export function useEndorseSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { endorseeId: string; skillId: number; message?: string }) =>
      apiFetch<ApiRes>('/skill-proofs/endorsements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['endorsements'] }),
  });
}

export function useMyEndorsements() {
  return useQuery({
    queryKey: ['endorsements', 'mine'],
    queryFn: () => apiFetch<ApiRes>('/skill-proofs/endorsements/me').then((r) => r.data!),
  });
}

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

export function useCreateRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { targetUserId: string; relationshipType: string }) =>
      apiFetch<ApiRes>('/relationships', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['relationships'] }),
  });
}

export function useMyRelationships() {
  return useQuery({
    queryKey: ['relationships', 'mine'],
    queryFn: () => apiFetch<ApiRes>('/relationships/me').then((r) => r.data!),
  });
}

export function useReputationGraph(userId: string) {
  return useQuery({
    queryKey: ['relationships', 'graph', userId],
    queryFn: () =>
      apiFetch<ApiRes>(`/relationships/graph/${userId}`).then((r) => r.data!),
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
      apiFetch<ApiRes>(`/talent-search?${searchParams.toString()}`).then(
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
      apiFetch<ApiRes>(`/verify/${studentId}`).then((r) => r.data!),
    enabled: !!studentId,
  });
}

// ---------------------------------------------------------------------------
// Auth: Forgot & Reset Password
// ---------------------------------------------------------------------------

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<ApiRes>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      apiFetch<ApiRes>('/auth/reset-password', {
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
      apiFetch<ApiRes>('/identity/share', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useDIDDocument(slug: string) {
  return useQuery({
    queryKey: ['identity', 'did', slug],
    queryFn: () =>
      apiFetch<ApiRes>(`/identity/${slug}/did.json`).then((r) => r.data ?? r),
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
      apiFetch<ApiRes>(`/credentials/${credentialId}/verify`).then((r) => r.data!),
    enabled: !!credentialId,
  });
}

// ---------------------------------------------------------------------------
// Student Verification Request
// ---------------------------------------------------------------------------

export function useRequestVerification() {
  return useMutation({
    mutationFn: (data: { studentId: string; institutionEmail: string }) =>
      apiFetch<ApiRes>('/verifications', {
        method: 'POST',
        body: JSON.stringify(data),
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
      apiFetch<ApiRes>('/collaborations/groups', {
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
      apiFetch<ApiRes>(`/search/institutions${params}`).then((r) => r.data!),
  });
}
