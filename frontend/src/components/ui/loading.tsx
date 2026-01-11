import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted rounded",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-shimmer",
        className
      )}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="p-6 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner size="md" />
      </div>
    </div>
  );
}

export function LoadingButton() {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span>Loading...</span>
    </div>
  );
}

// Skeleton loader for content with shimmer effect
export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded h-4",
        "bg-muted dark:bg-white/5",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-shimmer",
        className
      )}
    />
  );
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full h-10 w-10",
        "bg-muted dark:bg-white/5",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-shimmer",
        className
      )}
    />
  );
}

export function SkeletonPost({ withMedia = true }: { withMedia?: boolean }) {
  return (
    <div className="p-6 bg-[#0f121a] border border-white/5 rounded-[2rem] space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="w-32" />
            <div className="flex items-center gap-2">
              <SkeletonLine className="w-20 h-3" />
              <SkeletonLine className="w-12 h-3" />
            </div>
          </div>
        </div>
        <SkeletonBlock className="h-8 w-8 rounded-xl" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-11/12" />
        <SkeletonLine className="w-9/12" />
      </div>

      {withMedia && <SkeletonBlock className="h-52 rounded-2xl" />}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-8 w-16 rounded-xl" />
          <SkeletonBlock className="h-8 w-16 rounded-xl" />
          <SkeletonBlock className="h-8 w-16 rounded-xl" />
        </div>
        <SkeletonBlock className="h-8 w-10 rounded-xl" />
      </div>
    </div>
  );
}

// Page loading states
export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonPost key={i} withMedia={i % 3 !== 1} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="p-6 border border-border rounded-lg bg-card">
        <div className="flex items-start gap-4">
          <SkeletonAvatar className="h-20 w-20" />
          <div className="flex-1 space-y-3">
            <SkeletonLine className="w-32 h-6" />
            <SkeletonLine className="w-20 h-4" />
            <div className="space-y-2">
              <SkeletonLine />
              <SkeletonLine className="w-3/4" />
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <FeedSkeleton />
    </div>
  );
}
