"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { issueCredential } from "@/lib/api/credentials";
import { CREDENTIAL_CATEGORIES } from "@/lib/utils/constants";

export default function IssueCredentialPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    student_id: "",
    category: "ACADEMIC",
    title: "",
    description: "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => issueCredential(form),
    onSuccess: () => router.push("/credentials"),
    onError: (err: any) => setError(err.response?.data?.detail || "Failed to issue credential"),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Issue Credential</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Credential</CardTitle>
          <CardDescription>Issue a signed credential to a student</CardDescription>
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
              <label className="text-sm font-medium">Student ID</label>
              <Input
                placeholder="UUID of the student"
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CREDENTIAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g. Bachelor of Computer Science"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Issuing..." : "Issue Credential"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
