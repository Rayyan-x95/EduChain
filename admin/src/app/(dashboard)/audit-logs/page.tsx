"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getAuditLogs } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/utils/format";
import type { AuditLog } from "@/lib/types/api";

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("");
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter],
    queryFn: () => getAuditLogs(actionFilter ? { action: actionFilter } : {}),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <Input
          placeholder="Filter by action..."
          className="max-w-sm"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : (logs as AuditLog[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                (logs as AuditLog[]).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{l.actor_id?.slice(0, 8) || "system"}</TableCell>
                    <TableCell>
                      {l.target_type && (
                        <span className="text-xs">
                          {l.target_type}: {l.target_id?.slice(0, 8)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{l.ip_address || "—"}</TableCell>
                    <TableCell>{formatDateTime(l.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
