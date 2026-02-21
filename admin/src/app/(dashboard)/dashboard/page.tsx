"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getAuditLogs } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/utils/format";
import { Users, Award, Shield, FileCheck } from "lucide-react";

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardStats });
  const { data: logs } = useQuery({
    queryKey: ["audit-logs-recent"],
    queryFn: () => getAuditLogs({ limit: "10" }),
  });

  const cards = [
    { title: "Total Students", value: stats?.total_students ?? 0, icon: Users, color: "text-blue-500" },
    { title: "Verified", value: stats?.verified_students ?? 0, icon: FileCheck, color: "text-green-500" },
    { title: "Pending", value: stats?.pending_students ?? 0, icon: Shield, color: "text-yellow-500" },
    { title: "Credentials", value: stats?.total_credentials ?? 0, icon: Award, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your institution&apos;s verification activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="ml-2 text-sm">{log.target_type} {log.target_id?.slice(0, 8)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
