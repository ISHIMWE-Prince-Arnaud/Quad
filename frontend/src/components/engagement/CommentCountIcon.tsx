import { PiChatCircleBold, PiChatCircleFill } from "react-icons/pi";

import { cn } from "@/lib/utils";

export function CommentCountIcon({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  const hasComments = count > 0;

  if (hasComments) {
    return (
      <PiChatCircleFill
        className={cn("text-primary fill-current", className)}
      />
    );
  }

  return (
    <PiChatCircleBold className={cn("text-muted-foreground", className)} />
  );
}
