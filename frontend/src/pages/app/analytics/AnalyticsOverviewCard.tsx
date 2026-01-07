import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiProfile } from "@/types/api";

import type { EngagementSummary } from "./types";

export function AnalyticsOverviewCard({
  loading,
  error,
  profile,
  engagement,
}: {
  loading: boolean;
  error: string | null;
  profile: ApiProfile | null;
  engagement: EngagementSummary;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {loading && !profile && (
          <p className="text-muted-foreground">Loading analytics...</p>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground mb-1">Posts</p>
                <p className="text-xl font-semibold">{engagement.posts.total}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {engagement.posts.reactions} reactions · {engagement.posts.comments} comments
                </p>
              </div>
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground mb-1">Stories</p>
                <p className="text-xl font-semibold">{engagement.stories.total}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {engagement.stories.views} views
                </p>
              </div>
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground mb-1">Polls</p>
                <p className="text-xl font-semibold">{engagement.polls.total}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {engagement.polls.votes} votes
                </p>
              </div>
            </div>

            {profile && (
              <div className="grid gap-3 rounded-lg border p-3 text-xs sm:grid-cols-3 bg-card/60">
                <div>
                  <p className="text-muted-foreground mb-0.5">Followers</p>
                  <p className="text-base font-semibold">{profile.followers ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Following</p>
                  <p className="text-base font-semibold">{profile.following ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Mutual follows</p>
                  <p className="text-base font-semibold">{profile.mutualFollows ?? 0}</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
