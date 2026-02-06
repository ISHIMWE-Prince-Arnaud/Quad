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
        className,
      )}
    />
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded",
        "bg-muted dark:bg-white/5",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-shimmer",
        className,
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
        className,
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
        className,
      )}
    />
  );
}

export function SkeletonPost({
  mediaVariant = "wide",
}: {
  mediaVariant?: "none" | "wide" | "tall";
}) {
  const showMedia = mediaVariant !== "none";
  const mediaClass = mediaVariant === "tall" ? "h-72" : "h-52";

  return (
    <div className="p-6 bg-card border border-border/40 rounded-[2rem] space-y-4">
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

      {showMedia && <SkeletonBlock className={cn(mediaClass, "rounded-2xl")} />}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
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
        <SkeletonPost
          key={i}
          mediaVariant={i % 3 === 1 ? "none" : i % 4 === 0 ? "tall" : "wide"}
        />
      ))}
    </div>
  );
}

function ProfileTabsSkeleton({
  isOwnProfile = false,
}: {
  isOwnProfile?: boolean;
}) {
  const count = isOwnProfile ? 4 : 3;

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-4xl mx-auto">
        <div className="hidden sm:flex">
          <div className="flex space-x-1 w-full px-4 py-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex-1 py-2">
                <SkeletonBlock className="h-9 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="sm:hidden px-4 py-3">
          <SkeletonBlock className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ProfileSubTabsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <SkeletonBlock className="h-9 w-20 rounded-full" />
      <SkeletonBlock className="h-9 w-24 rounded-full" />
      <SkeletonBlock className="h-9 w-20 rounded-full" />
    </div>
  );
}

function SkeletonStoryCard() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-4">
      <SkeletonBlock className="h-40 w-full rounded-xl" />
      <div className="space-y-2">
        <SkeletonLine className="w-4/5 h-4" />
        <SkeletonLine className="w-2/3 h-3" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <SkeletonAvatar className="h-8 w-8" />
          <SkeletonLine className="w-24 h-3" />
        </div>
        <SkeletonBlock className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

function StoriesGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 items-start">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStoryCard key={i} />
      ))}
    </div>
  );
}

function SkeletonPollCard() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <SkeletonAvatar />
          <div className="space-y-2">
            <SkeletonLine className="w-40 h-4" />
            <SkeletonLine className="w-24 h-3" />
          </div>
        </div>
        <SkeletonBlock className="h-8 w-8 rounded-xl" />
      </div>

      <div className="space-y-2">
        <SkeletonLine className="w-full h-5" />
        <SkeletonLine className="w-10/12 h-5" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-16 rounded-full" />
          <SkeletonBlock className="h-8 w-16 rounded-full" />
          <SkeletonBlock className="h-8 w-16 rounded-full" />
        </div>
        <SkeletonBlock className="h-8 w-10 rounded-xl" />
      </div>
    </div>
  );
}

function PollsListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonPollCard key={i} />
      ))}
    </div>
  );
}

function ProfileHeaderSkeleton({
  isOwnProfile = false,
}: {
  isOwnProfile?: boolean;
}) {
  return (
    <div className="relative overflow-hidden border-0 shadow-lg rounded-lg">
      <div
        className="relative h-48 sm:h-56 lg:h-64"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 55%, #2563eb 100%), radial-gradient(circle at 18px 18px, transparent 0 14px, rgba(255,255,255,0.14) 14px 15px, transparent 15px 36px)",
          backgroundSize: "cover, 36px 36px",
          backgroundPosition: "center, 0 0",
        }}>
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <SkeletonBlock className="h-9 w-28 rounded-full bg-black/20" />
          </div>
        )}
      </div>

      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <SkeletonAvatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl" />
              {isOwnProfile && (
                <SkeletonBlock className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-2 sm:pt-0 space-y-2">
              <SkeletonLine className="w-52 h-7" />
              <SkeletonLine className="w-28 h-4" />
            </div>
          </div>

          <div className="flex gap-2 mt-4 sm:mt-0">
            {isOwnProfile ? (
              <SkeletonBlock className="h-10 w-28 rounded-full" />
            ) : (
              <>
                <SkeletonBlock className="h-10 w-28 rounded-full" />
                <SkeletonBlock className="h-10 w-10 rounded-full" />
              </>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <SkeletonLine className="w-full h-4" />
            <SkeletonLine className="w-9/12 h-4" />
          </div>

          <div className="flex flex-wrap gap-4">
            <SkeletonLine className="w-40 h-4" />
          </div>

          <div className="mt-2 -mx-6 px-6 py-5 border-t border-border/40">
            <div className="grid grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <SkeletonLine className="h-6 w-12 mx-auto" />
                  <SkeletonLine className="h-3 w-20 mx-auto mt-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div
              className={cn(
                "grid gap-3",
                isOwnProfile ? "grid-cols-4" : "grid-cols-3",
              )}>
              {Array.from({ length: isOwnProfile ? 4 : 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4 text-center shadow-sm">
                  <SkeletonLine className="h-6 w-12 mx-auto" />
                  <SkeletonLine className="h-3 w-20 mx-auto mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton({
  isOwnProfile = false,
}: {
  isOwnProfile?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="px-4 py-6">
          <ProfileHeaderSkeleton isOwnProfile={isOwnProfile} />
        </div>
        <ProfileTabsSkeleton isOwnProfile={isOwnProfile} />
        <div className="px-4 py-8">
          <FeedSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ProfileStoriesTabSkeleton() {
  return (
    <div className="px-4 py-8 space-y-6">
      <StoriesGridSkeleton />
    </div>
  );
}

export function ProfilePollsTabSkeleton() {
  return (
    <div className="px-4 py-8 space-y-6">
      <PollsListSkeleton />
    </div>
  );
}

export function ProfileBookmarksTabSkeleton() {
  return (
    <div className="px-4 py-8 space-y-6">
      <ProfileSubTabsSkeleton />
      <FeedSkeleton />
    </div>
  );
}

export function ProfileBookmarksStoriesTabSkeleton() {
  return (
    <div className="px-4 py-8 space-y-6">
      <ProfileSubTabsSkeleton />
      <StoriesGridSkeleton />
    </div>
  );
}

export function ProfileBookmarksPollsTabSkeleton() {
  return (
    <div className="px-4 py-8 space-y-6">
      <ProfileSubTabsSkeleton />
      <PollsListSkeleton />
    </div>
  );
}
