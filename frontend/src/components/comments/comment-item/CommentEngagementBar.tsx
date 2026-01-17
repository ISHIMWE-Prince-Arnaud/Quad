import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

export function CommentEngagementBar({
  liked,
  likesCount,
  likePending,
  onToggleLike,
}: {
  liked: boolean;
  likesCount: number;
  likePending: boolean;
  onToggleLike: () => void;
}) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <button
        onClick={onToggleLike}
        disabled={likePending}
        className={cn(
          "flex items-center gap-2 text-xs font-semibold transition-colors",
          liked ? "text-[#ef4444]" : "text-[#94a3b8] hover:text-white"
        )}>
        <Heart className={cn("h-4 w-4", liked && "fill-current")} />
        <span>{likesCount}</span>
      </button>
    </div>
  );
}
