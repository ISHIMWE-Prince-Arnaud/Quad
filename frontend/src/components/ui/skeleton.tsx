import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("skeleton", className)} {...props} />;
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
