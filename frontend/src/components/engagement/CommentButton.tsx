import { Link } from "react-router-dom";
import { PiChatCircleBold, PiChatCircleFill } from "react-icons/pi";
import { cn } from "@/lib/utils";

export function CommentButton({
  postId,
  count,
  className,
  iconClassName,
  countClassName,
}: {
  postId: string;
  count: number;
  className?: string;
  iconClassName?: string;
  countClassName?: string;
}) {
  const hasComments = count > 0;

  return (
    <Link
      to={`/posts/${postId}`}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground transition-all group",
        hasComments
          ? "hover:bg-primary/5 active:scale-95"
          : "hover:bg-primary/10",
        hasComments && "text-primary",
        className,
      )}
      aria-label={`${count} comments`}
      title="Comments">
      <div className="relative inline-flex items-center justify-center">
        {hasComments ? (
          <PiChatCircleFill
            className={cn(
              "h-[18px] w-[18px] transition-all duration-300 fill-current",
              iconClassName,
            )}
          />
        ) : (
          <PiChatCircleBold
            className={cn(
              "h-[18px] w-[18px] transition-all duration-300 text-muted-foreground group-hover:text-primary group-hover:scale-110",
              iconClassName,
            )}
          />
        )}
      </div>

      <span
        className={cn(
          "text-xs font-bold tabular-nums transition-colors",
          hasComments
            ? "text-primary"
            : "text-muted-foreground group-hover:text-primary",
          countClassName,
        )}>
        {count}
      </span>
    </Link>
  );
}

