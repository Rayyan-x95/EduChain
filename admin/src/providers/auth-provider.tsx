"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
