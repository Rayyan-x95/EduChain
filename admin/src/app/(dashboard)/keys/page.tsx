"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { generateKey, rotateKey } from "@/lib/api/admin";
import apiClient from "@/lib/api/client";
import { formatDateTime } from "@/lib/utils/format";
import type { SigningKey } from "@/lib/types/api";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function KeysPage() {
  const user = useAuthStore((s) => s.user);
  const { data: keys = [], refetch } = useQuery({
    queryKey: ["keys"],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await apiClient.get(`/institutions/${user.institution_id}/public-keys`);
      return data;
    },
    enabled: !!user,
  });

  const genMutation = useMutation({ mutationFn: generateKey, onSuccess: () => refetch() });
  const rotateMutation = useMutation({ mutationFn: rotateKey, onSuccess: () => refetch() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Key Management</h1>
        <div className="space-x-2">
          <Button onClick={() => genMutation.mutate()} disabled={genMutation.isPending}>
            Generate Key
          </Button>
          <Button variant="outline" onClick={() => rotateMutation.mutate()} disabled={rotateMutation.isPending}>
            Rotate Key
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fingerprint</TableHead>
                <TableHead>Algorithm</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(keys as SigningKey[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No keys generated yet
                  </TableCell>
                </TableRow>
              ) : (
                (keys as SigningKey[]).map((k) => (
                  <TableRow key={k.key_id}>
                    <TableCell className="font-mono text-xs">{k.fingerprint.slice(0, 16)}...</TableCell>
                    <TableCell>{k.algorithm}</TableCell>
                    <TableCell>
                      <Badge variant={k.status === "ACTIVE" ? "success" : "secondary"}>{k.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(k.created_at)}</TableCell>
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
