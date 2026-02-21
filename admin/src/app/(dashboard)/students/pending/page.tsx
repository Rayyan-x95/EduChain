"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getStudents, updateStudentStatus } from "@/lib/api/students";
import { formatDate } from "@/lib/utils/format";
import type { StudentProfile } from "@/lib/types/api";

export default function PendingStudentsPage() {
  const queryClient = useQueryClient();
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
  });

  const pending = (students as StudentProfile[]).filter((s) => s.status === "PENDING");

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateStudentStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Verification</h1>
        <p className="text-muted-foreground">{pending.length} student(s) awaiting verification</p>
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
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No pending students
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.enrollment_number || "—"}</TableCell>
                    <TableCell>{s.program || "—"}</TableCell>
                    <TableCell>{formatDate(s.created_at)}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => mutation.mutate({ id: s.id, status: "VERIFIED" })}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => mutation.mutate({ id: s.id, status: "REJECTED" })}
                      >
                        Reject
                      </Button>
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
