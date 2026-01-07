import { Card, CardContent } from "@/components/ui/card";
import type { Story } from "@/types/story";

export function MyStoriesSidebar({
  loadingMine,
  myDrafts,
  myPublished,
}: {
  loadingMine: boolean;
  myDrafts: Story[];
  myPublished: Story[];
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6 space-y-4">
        <h2 className="text-sm font-medium">My Stories</h2>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Drafts</div>
          {loadingMine && (
            <div className="text-xs text-muted-foreground">Loading...</div>
          )}
          {!loadingMine && myDrafts.length === 0 && (
            <div className="text-xs text-muted-foreground">No drafts yet</div>
          )}
          {myDrafts.map((s) => (
            <a
              key={s._id}
              href={`/app/stories/${s._id}`}
              className="block truncate hover:underline">
              {s.title}
            </a>
          ))}
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Published</div>
          {!loadingMine && myPublished.length === 0 && (
            <div className="text-xs text-muted-foreground">
              No published stories
            </div>
          )}
          {myPublished.map((s) => (
            <a
              key={s._id}
              href={`/app/stories/${s._id}`}
              className="block truncate hover:underline">
              {s.title}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
