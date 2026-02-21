"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/lib/api/client";

export default function CommunityPage() {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/community/leaderboard?limit=20");
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Community</h1>

      <Card>
        <CardHeader>
          <CardTitle>Reputation Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-muted-foreground">No data available</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry: any) => (
                <div key={entry.user_id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {entry.rank}
                    </span>
                    <div>
                      <p className="font-medium">{entry.full_name}</p>
                      <p className="text-xs text-muted-foreground">{entry.program || "—"}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{entry.total_score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
