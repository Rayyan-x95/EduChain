"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getPendingAppeals, reviewAppeal } from "@/lib/api/appeals";
import { formatDateTime } from "@/lib/utils/format";
import type { Appeal } from "@/lib/types/api";

export default function AppealsPage() {
  const queryClient = useQueryClient();
  const { data: appeals = [], isLoading } = useQuery({
    queryKey: ["appeals"],
    queryFn: getPendingAppeals,
  });
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      reviewAppeal(id, status, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appeals"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Appeals Queue</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Supporting Doc</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : appeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No pending appeals
                  </TableCell>
                </TableRow>
              ) : (
                (appeals as Appeal[]).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.student_id.slice(0, 8)}...</TableCell>
                    <TableCell className="max-w-xs truncate">{a.reason}</TableCell>
                    <TableCell>
                      {a.supporting_doc_url ? (
                        <a href={a.supporting_doc_url} target="_blank" rel="noreferrer" className="text-primary underline">
                          View
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{formatDateTime(a.submitted_at)}</TableCell>
                    <TableCell>{formatDateTime(a.appeal_deadline)}</TableCell>
                    <TableCell>
                      <Input
                        placeholder="Review notes"
                        className="w-40"
                        value={reviewNotes[a.id] || ""}
                        onChange={(e) => setReviewNotes({ ...reviewNotes, [a.id]: e.target.value })}
                      />
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button
                        size="sm"
                        onClick={() =>
                          mutation.mutate({ id: a.id, status: "APPROVED", notes: reviewNotes[a.id] })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          mutation.mutate({ id: a.id, status: "REJECTED", notes: reviewNotes[a.id] })
                        }
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
