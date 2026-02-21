"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { assignRole } from "@/lib/api/admin";
import { ROLES } from "@/lib/utils/constants";

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => assignRole(userId, role),
    onSuccess: () => {
      setMessage("Role assigned successfully");
      setUserId("");
    },
    onError: (err: any) => setMessage(err.response?.data?.detail || "Failed"),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Role Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Assign Role</CardTitle>
          <CardDescription>Assign an institutional role to a user</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input placeholder="UUID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {message && <p className="text-sm">{message}</p>}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Assigning..." : "Assign Role"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
