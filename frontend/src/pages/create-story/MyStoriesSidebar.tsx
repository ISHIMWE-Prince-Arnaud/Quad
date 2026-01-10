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
    <Card className="bg-[#0f121a] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          My Stories
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">
              Drafts
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full">
              {myDrafts.length}
            </span>
          </div>

          {loadingMine ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : myDrafts.length === 0 ? (
            <div className="py-4 text-center border border-dashed border-white/5 rounded-2xl">
              <p className="text-[11px] font-medium text-[#64748b]">
                No drafts yet
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {myDrafts.map((s) => (
                <a
                  key={s._id}
                  href={`/app/stories/${s._id}`}
                  className="block p-2 rounded-xl text-[13px] font-medium text-[#f1f5f9] hover:bg-white/5 hover:text-[#2563eb] transition-all truncate">
                  {s.title || "Untitled Draft"}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">
              Published
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
              {myPublished.length}
            </span>
          </div>

          {loadingMine ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : myPublished.length === 0 ? (
            <div className="py-4 text-center border border-dashed border-white/5 rounded-2xl">
              <p className="text-[11px] font-medium text-[#64748b]">
                No stories yet
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {myPublished.map((s) => (
                <a
                  key={s._id}
                  href={`/app/stories/${s._id}`}
                  className="block p-2 rounded-xl text-[13px] font-medium text-[#f1f5f9] hover:bg-white/5 hover:text-[#2563eb] transition-all truncate">
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
