import { createSupabaseBrowserClient } from '@educhain/auth';

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

let _client: SupabaseClient | undefined;

function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createSupabaseBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

// Backward-compatible export – lazily initializes on first property access
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getSupabase() as any)[prop],
});
