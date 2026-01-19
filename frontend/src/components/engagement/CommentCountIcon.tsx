import { MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function CommentCountIcon({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <MessageCircle
      className={cn(
        className,
        count > 0 && "text-[#2563EB] fill-current"
      )}
    />
  );
}
