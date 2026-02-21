"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getStudents, updateStudentStatus } from "@/lib/api/students";
import { formatDate } from "@/lib/utils/format";
import type { StudentProfile } from "@/lib/types/api";

const statusColor: Record<string, "success" | "warning" | "destructive" | "secondary" | "default"> = {
  VERIFIED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
  APPEAL_SUBMITTED: "secondary",
  FINAL_REJECTED: "destructive",
  BLACKLISTED: "destructive",
};

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateStudentStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });

  const filtered = students.filter(
    (s: StudentProfile) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.enrollment_number || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students</h1>
        <Input
          placeholder="Search students..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No students found</TableCell>
                </TableRow>
              ) : (
                filtered.map((s: StudentProfile) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.enrollment_number || "—"}</TableCell>
                    <TableCell>{s.program || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor[s.status] || "default"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(s.created_at)}</TableCell>
                    <TableCell className="space-x-1">
                      {s.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => mutation.mutate({ id: s.id, status: "VERIFIED" })}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => mutation.mutate({ id: s.id, status: "REJECTED" })}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {s.status === "VERIFIED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => mutation.mutate({ id: s.id, status: "SUSPENDED" })}
                        >
                          Suspend
                        </Button>
                      )}
                    </TableCell>
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
