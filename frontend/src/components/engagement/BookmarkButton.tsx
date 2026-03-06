import { PiBookmarkSimpleBold, PiBookmarkSimpleFill } from "react-icons/pi";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  bookmarked,
  pending,
  onToggle,
  className,
  iconClassName,
  ariaLabel,
}: {
  bookmarked: boolean;
  pending?: boolean;
  onToggle: () => void | Promise<void>;
  className?: string;
  iconClassName?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={bookmarked}
      aria-label={ariaLabel}
      title={ariaLabel}
        className={cn(
          "relative inline-flex items-center justify-center p-2 rounded-xl transition-all group",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60",
          bookmarked
            ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            : "text-muted-foreground hover:bg-amber-500/10",
          className,
        )}>
      <div className="relative inline-flex items-center justify-center">
        {bookmarked ? (
          <PiBookmarkSimpleFill
            className={cn(
              "h-5 w-5 transition-all duration-300 fill-current",
              iconClassName,
            )}
          />
        ) : (
          <PiBookmarkSimpleBold
            className={cn(
              "h-5 w-5 transition-all duration-300 text-muted-foreground group-hover:text-amber-500 group-hover:scale-110",
              iconClassName,
            )}
          />
        )}
      </div>
    </button>
  );
}
