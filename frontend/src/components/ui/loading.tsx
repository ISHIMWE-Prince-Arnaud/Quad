import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./button";

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

// Re-export basic blocks for backward compatibility if needed,
// but prefer using Skeleton component directly for new code.
export function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton className={className} />;
}

export function LoadingPage() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <SkeletonLine className="w-48 h-8 rounded-md" />
        <SkeletonLine className="w-64 h-4 rounded-md opacity-60" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/40 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <SkeletonAvatar className="h-10 w-10" />
              <div className="space-y-2">
                <SkeletonLine className="w-32 h-4" />
                <SkeletonLine className="w-24 h-3" />
              </div>
            </div>
            <div className="space-y-2">
              <SkeletonLine className="w-full h-4" />
              <SkeletonLine className="w-11/12 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-card border border-border/40 rounded-[2rem] p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <SkeletonAvatar className="h-10 w-10" />
        <div className="space-y-2">
          <SkeletonLine className="w-32 h-4" />
          <SkeletonLine className="w-24 h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLine className="w-full h-4" />
        <SkeletonLine className="w-11/12 h-4" />
      </div>
    </div>
  );
}

export function LoadingButton() {
  return (
    <div className="flex items-center justify-center min-w-[24px]">
      <LoadingSpinner size="sm" className="opacity-60" />
    </div>
  );
}

export function LoadMoreButton({
  onClick,
  loading,
  label = "Load more",
  className,
}: {
  onClick: () => void | Promise<void>;
  loading: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center w-full py-8", className)}>
      <Button
        variant="outline"
        size="lg"
        onClick={onClick}
        loading={loading}
        className="rounded-full px-10 border-border/60 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/30 hover:text-primary transition-all duration-300 font-semibold shadow-sm group">
        <span className="flex items-center gap-2">{label}</span>
      </Button>
    </div>
  );
}

export function InfiniteScrollLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 w-full",
        className,
      )}>
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/40 bg-muted/20 animate-pulse">
        <div className="h-2 w-2 rounded-full bg-primary/40" />
        <div className="h-2 w-2 rounded-full bg-primary/40 [animation-delay:150ms]" />
        <div className="h-2 w-2 rounded-full bg-primary/40 [animation-delay:300ms]" />
      </div>
      <span className="text-xs font-medium text-muted-foreground/60 tracking-wider uppercase">
        Loading more content
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------
// Specific Component Skeletons
// ----------------------------------------------------------------------

export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4", className)} />;
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-full h-10 w-10", className)} />;
}

// Matches PostCard.tsx
export function SkeletonPost({
  mediaVariant = "wide",
}: {
  mediaVariant?: "none" | "wide" | "tall";
}) {
  const showMedia = mediaVariant !== "none";
  const mediaClass = mediaVariant === "tall" ? "h-96" : "h-64";

  return (
    <div className="bg-card border border-border/40 rounded-[2rem] overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 w-full">
          <SkeletonAvatar className="h-10 w-10 border-2 border-border/10" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <SkeletonLine className="w-32 h-4 rounded-md" />
            <div className="flex items-center gap-2">
              <SkeletonLine className="w-20 h-3 rounded-md opacity-70" />
            </div>
          </div>
        </div>
        <SkeletonBlock className="h-8 w-8 rounded-full opacity-50" />
      </div>

      {/* Content */}
      <div className="px-6 pb-6 space-y-4">
        <div className="space-y-2">
          <SkeletonLine className="w-full h-4 rounded-md" />
          <SkeletonLine className="w-11/12 h-4 rounded-md" />
          <SkeletonLine className="w-9/12 h-4 rounded-md" />
        </div>

        {showMedia && (
          <SkeletonBlock className={cn("w-full rounded-2xl", mediaClass)} />
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex items-center gap-4 border-t border-border/40 bg-muted/30">
        <div className="flex items-center gap-6">
          <SkeletonBlock className="h-5 w-12 rounded-md opacity-60" />
          <SkeletonBlock className="h-5 w-8 rounded-md opacity-60" />
          <SkeletonBlock className="h-5 w-8 rounded-md opacity-60" />
        </div>
        <div className="ml-auto">
          <SkeletonBlock className="h-5 w-5 rounded-md opacity-60" />
        </div>
      </div>
    </div>
  );
}

// Matches NotificationRow.tsx
export function NotificationSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border/40 bg-card">
      <SkeletonAvatar className="h-10 w-10 shrink-0 border border-border/50" />
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-2 w-full">
            <SkeletonLine className="w-3/4 h-4 rounded-md" />
            <SkeletonLine className="w-1/2 h-3 rounded-md opacity-70" />
          </div>
          <SkeletonLine className="w-10 h-3 rounded-md opacity-50 shrink-0" />
        </div>
      </div>
    </div>
  );
}

// Matches StoryCard.tsx (Grid)
export function SkeletonStoryCard() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden h-full flex flex-col">
      {/* Cover Image */}
      <div className="aspect-video w-full relative">
        <SkeletonBlock className="absolute inset-0 h-full w-full" />
      </div>

      <div className="px-6 pt-5 pb-4 flex-1 flex flex-col">
        <div className="space-y-2.5 mb-auto">
          <SkeletonLine className="h-5 w-11/12 rounded-md" />
          <div className="space-y-1.5 pt-1">
            <SkeletonLine className="h-3.5 w-full rounded-md opacity-70" />
            <SkeletonLine className="h-3.5 w-2/3 rounded-md opacity-70" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <SkeletonAvatar className="h-7 w-7" />
            <div className="space-y-1">
              <SkeletonLine className="w-20 h-3 rounded-md" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-4 w-8 rounded-md opacity-50" />
            <SkeletonBlock className="h-4 w-8 rounded-md opacity-50" />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex items-center justify-between">
        <SkeletonLine className="w-16 h-3 rounded-md opacity-50" />
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-7 w-7 rounded-lg opacity-40" />
          <SkeletonBlock className="h-7 w-7 rounded-lg opacity-40" />
        </div>
      </div>
    </div>
  );
}

// Matches PollCard.tsx
export function SkeletonPollCard() {
  return (
    <div className="rounded-3xl border border-border/40 bg-card overflow-hidden shadow-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 w-full">
          <SkeletonAvatar className="h-11 w-11 rounded-full border border-border/10" />
          <div className="space-y-1.5 flex-1">
            <SkeletonLine className="w-32 h-4 rounded-md" />
            <SkeletonLine className="w-24 h-3 rounded-md opacity-70" />
          </div>
        </div>
        <SkeletonBlock className="h-8 w-8 rounded-full opacity-50" />
      </div>

      <div className="space-y-2 pt-1">
        <SkeletonLine className="w-full h-5 rounded-md" />
        <SkeletonLine className="w-10/12 h-5 rounded-md" />
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-14 rounded-lg opacity-50" />
          <SkeletonBlock className="h-8 w-14 rounded-lg opacity-50" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-16 rounded-full opacity-50" />
          <SkeletonBlock className="h-8 w-8 rounded-xl opacity-50" />
        </div>
      </div>
    </div>
  );
}

// Matches ChatMessageList.tsx bubbles
export function ChatMessageSkeleton({ isSelf }: { isSelf: boolean }) {
  return (
    <div
      className={cn(
        "py-0 mt-1.5 flex items-start gap-3",
        isSelf ? "justify-end" : "justify-start",
      )}>
      {!isSelf && <SkeletonAvatar className="h-8 w-8 shrink-0" />}

      <div
        className={cn(
          "flex flex-col max-w-[75%]",
          isSelf ? "items-end" : "items-start",
        )}>
        <SkeletonBlock
          className={cn(
            "h-10 w-48 rounded-[1.25rem]",
            isSelf ? "bg-primary/20" : "bg-muted",
          )}
        />
      </div>

      {isSelf && <SkeletonAvatar className="h-8 w-8 shrink-0" />}
    </div>
  );
}

// Matches CommentsSection
export function CommentsSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border/40 p-5">
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-4 w-40 rounded-md opacity-50" />
      </div>

      <div className="mt-4">
        <div className="flex items-start gap-3">
          <SkeletonAvatar className="h-8 w-8 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-3 rounded-2xl bg-muted/70 border border-border/40 px-4 py-2">
              <SkeletonLine className="h-4 w-8/12 bg-transparent" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 divide-y divide-border/20">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-4">
            <div className="flex gap-3">
              <SkeletonAvatar className="h-9 w-9 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <SkeletonLine className="h-4 w-28 rounded-md" />
                  <SkeletonLine className="h-3 w-16 rounded-md opacity-50" />
                </div>
                <div className="space-y-2">
                  <SkeletonLine className="w-full h-4 rounded-md" />
                  <SkeletonLine className="w-10/12 h-4 rounded-md" />
                </div>
                <div className="pt-1">
                  <SkeletonLine className="h-4 w-20 rounded-md opacity-50" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-6 px-4 py-6">
      <ChatMessageSkeleton isSelf={false} />
      <ChatMessageSkeleton isSelf={false} />
      <ChatMessageSkeleton isSelf={true} />
      <ChatMessageSkeleton isSelf={true} />
      <ChatMessageSkeleton isSelf={false} />
    </div>
  );
}

// Matches StoryPage.tsx single view
export function StoryPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-8 w-32 rounded-md" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <SkeletonLine className="h-8 w-3/4 rounded-md" />
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-9 w-9 rounded-full" />
            <SkeletonBlock className="h-9 w-9 rounded-full" />
          </div>
        </div>

        <SkeletonBlock className="w-full h-[360px] rounded-xl" />

        <div className="rounded-[1.5rem] border border-border/40 bg-card overflow-hidden">
          <div className="p-4 md:p-6 space-y-6">
            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
              <SkeletonLine className="w-24 h-4 rounded-md" />
              <SkeletonLine className="w-20 h-3 rounded-md opacity-70" />
              <SkeletonLine className="w-16 h-3 rounded-md opacity-70" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <SkeletonLine className="w-full h-4" />
              <SkeletonLine className="w-full h-4" />
              <SkeletonLine className="w-11/12 h-4" />
              <SkeletonLine className="w-full h-4" />
              <SkeletonLine className="w-4/5 h-4" />
            </div>

            {/* Reactions */}
            <div className="pt-4 flex items-center justify-between">
              <SkeletonBlock className="h-10 w-24 rounded-xl" />
              <SkeletonBlock className="h-10 w-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Page Skeletons
// ----------------------------------------------------------------------

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonPost key={i} mediaVariant={i % 2 === 0 ? "wide" : "none"} />
      ))}
    </div>
  );
}

export function StoriesGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 items-start">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStoryCard key={i} />
      ))}
    </div>
  );
}

export function PollsListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonPollCard key={i} />
      ))}
    </div>
  );
}

// Keeping Profile skeletons as they were mostly fine, but reused components could be improved if needed.
// For now, retaining the logic but ensuring they use the improved basic blocks.

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

function ProfileHeaderSkeleton({
  isOwnProfile = false,
}: {
  isOwnProfile?: boolean;
}) {
  return (
    <div className="relative overflow-hidden border-0 shadow-lg rounded-lg">
      <div className="relative h-48 sm:h-56 lg:h-64 bg-muted animate-pulse">
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
              <SkeletonLine className="w-28 h-4 opacity-70" />
            </div>
          </div>

          <div className="flex gap-2 mt-4 sm:mt-0">
            <SkeletonBlock className="h-10 w-28 rounded-full" />
            {!isOwnProfile && (
              <SkeletonBlock className="h-10 w-10 rounded-full" />
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
                <div key={i} className="text-center space-y-2">
                  <SkeletonLine className="h-5 w-12 mx-auto" />
                  <SkeletonLine className="h-3 w-16 mx-auto opacity-70" />
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
export function MainAppSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header Placeholder */}
      <div className="lg:hidden px-4 py-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <SkeletonLine className="w-20 h-4" />
              <SkeletonLine className="w-28 h-3 opacity-60" />
            </div>
          </div>
          <SkeletonBlock className="h-9 w-9 rounded-xl opacity-50" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Placeholder */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="h-full px-4 py-8 space-y-8 border-r border-border/40 bg-sidebar/50 animate-pulse">
            <div className="px-4 mb-4">
              <SkeletonBlock className="h-10 w-32 rounded-lg opacity-80" />
            </div>
            <div className="space-y-4 px-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2">
                  <SkeletonBlock className="h-9 w-9 rounded-xl opacity-60" />
                  <SkeletonLine className={i % 2 === 0 ? "w-24" : "w-16"} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 lg:pl-64 xl:pr-80">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <FeedSkeleton />
          </div>
        </div>

        {/* Right Panel Placeholder */}
        <div className="hidden xl:flex xl:w-80 xl:flex-col xl:fixed xl:right-0 xl:inset-y-0">
          <div className="h-full px-6 py-8 space-y-8 border-l border-border/40 bg-sidebar/30 animate-pulse">
            <div className="space-y-4">
              <SkeletonLine className="w-32 h-4" />
              <SkeletonBlock className="h-48 rounded-3xl opacity-60" />
            </div>
            <div className="space-y-4">
              <SkeletonLine className="w-28 h-4 " />
              <SkeletonBlock className="h-32 rounded-3xl opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
