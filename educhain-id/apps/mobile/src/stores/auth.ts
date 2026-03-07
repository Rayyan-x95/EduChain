import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  appUser: { userId: string; email: string; role: string } | null;
  setSession: (session: Session | null) => void;
  setAppUser: (appUser: AuthState['appUser']) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  appUser: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setAppUser: (appUser) => set({ appUser }),
  clearAuth: () => set({ session: null, user: null, appUser: null }),
}));
