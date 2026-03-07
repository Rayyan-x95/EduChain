import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for browser / React Native environments.
 * Uses the **anon key** — safe to expose in client bundles.
 */
export function createSupabaseBrowserClient(
  url: string,
  anonKey: string,
): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Create a Supabase client for server / backend environments.
 * Uses the **service-role key** — must NEVER be exposed to clients.
 */
export function createSupabaseServerClient(
  url: string,
  serviceRoleKey: string,
): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { type SupabaseClient } from '@supabase/supabase-js';
