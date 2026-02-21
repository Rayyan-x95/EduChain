"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn("transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
