import { PiChatCircleBold } from "react-icons/pi";

import { cn } from "@/lib/utils";

export function CommentCountIcon({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <PiChatCircleBold
      className={cn(className, count > 0 && "text-[#2563EB] fill-current")}
    />
  );
}
