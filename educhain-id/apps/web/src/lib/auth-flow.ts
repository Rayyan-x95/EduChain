const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/api/v1';

type SyncUserResult = {
  role?: string;
  is_new?: boolean;
  isNew?: boolean;
};

export function appHomeForRole(role?: string | null) {
  switch (role) {
    case 'institution_admin':
      return '/institution/dashboard';
    case 'recruiter':
      return '/recruiter/discover';
    default:
      return '/dashboard';
  }
}

export async function syncBackendUser(accessToken: string) {
  const response = await fetch(`${API_BASE}/auth/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? payload?.message ?? 'Failed to sync account');
  }

  const payload = (await response.json()) as { data?: SyncUserResult };
  return payload.data ?? {};
}

export async function recordConsent(accessToken: string, consentType: string) {
  await fetch(`${API_BASE}/gdpr/consent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      consentType,
      granted: true,
    }),
  });
}
