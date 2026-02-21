"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getCredentials } from "@/lib/api/credentials";
import { formatDate } from "@/lib/utils/format";
import type { Credential } from "@/lib/types/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CredentialsPage() {
  const { data: credentials = [], isLoading } = useQuery({
    queryKey: ["credentials"],
    queryFn: getCredentials,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Credentials</h1>
        <Link href="/credentials/issue">
          <Button>Issue Credential</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : (credentials as Credential[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No credentials issued yet
                  </TableCell>
                </TableRow>
              ) : (
                (credentials as Credential[]).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><Badge variant="secondary">{c.category}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{c.student_id.slice(0, 8)}...</TableCell>
                    <TableCell>v{c.current_version}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "ACTIVE" ? "success" : "destructive"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(c.issued_at)}</TableCell>
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
