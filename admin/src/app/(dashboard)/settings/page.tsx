"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Institution Settings</CardTitle>
          <CardDescription>Manage your institution&apos;s configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Institution ID</label>
            <Input disabled value={user?.institution_id || ""} />
          </div>
          <div>
            <label className="text-sm font-medium">Admin Email</label>
            <Input disabled value={user?.email || ""} />
          </div>
          <p className="text-sm text-muted-foreground">
            Contact the platform administrator to update institution settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
