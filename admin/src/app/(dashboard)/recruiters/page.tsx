"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruitersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recruiters</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Monitor recruiter search activity and manage portal access. Recruiter search data will appear here once the recruiter portal is active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
