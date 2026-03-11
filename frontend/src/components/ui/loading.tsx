import { cn } from "@/lib/utils";
import { PiSpinnerBold } from "react-icons/pi";
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
    <PiSpinnerBold
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className,
      )}
    />
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton className={className} />;
}

export function LoadingPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-[100] animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse-subtle scale-150" />
        <div className="relative z-10 p-4 rounded-full bg-background/40 backdrop-blur-sm border border-border/40 shadow-2xl">
          <LoadingSpinner size="lg" className="text-primary" />
        </div>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-4 animate-pulse">
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
      <TypingIndicator />
      <span className="text-xs font-medium text-muted-foreground/60 tracking-wider uppercase">
        Loading more content
      </span>
    </div>
  );
}

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/40 bg-muted/20 animate-pulse",
        className,
      )}>
      <div className="h-2 w-2 rounded-full bg-primary/40" />
      <div className="h-2 w-2 rounded-full bg-primary/40 [animation-delay:150ms]" />
      <div className="h-2 w-2 rounded-full bg-primary/40 [animation-delay:300ms]" />
    </div>
  );
}

export function ChatLoadingOlderSkeleton() {
  return (
    <div className="flex items-center justify-center py-6">
      <TypingIndicator />
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

export function SkeletonStoryAvatar() {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <SkeletonAvatar className="h-14 w-14 border border-border/40" />
      <SkeletonLine className="h-3 w-12 rounded" />
    </div>
  );
}

// Matches PostCard.tsx
export function SkeletonPost({
  mediaType = "image",
  hasText = true,
}: {
  mediaType?: "image" | "video";
  hasText?: boolean;
}) {
  return (
    <div className="bg-card border border-border/40 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 w-full">
          <SkeletonAvatar className="h-10 w-10 border-2 border-border/10 shadow-sm" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <SkeletonLine className="w-32 h-4 rounded-md" />
            <div className="flex items-center gap-2">
              <SkeletonLine className="w-20 h-3 rounded-md opacity-70" />
            </div>
          </div>
        </div>
        <SkeletonBlock className="h-8 w-8 rounded-full opacity-50 bg-muted" />
      </div>

      {/* Content */}
      <div className="px-6 pb-6 space-y-4">
        {hasText && (
          <div className="space-y-2">
            <SkeletonLine className="w-full h-4 rounded-md" />
            <SkeletonLine className="w-11/12 h-4 rounded-md" />
          </div>
        )}

        {/* Media Placeholder */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted/15 border border-border/20">
          <SkeletonBlock className="absolute inset-0 h-full w-full opacity-40" />
          {mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center backdrop-blur-sm">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-primary/50 border-b-[10px] border-b-transparent ml-1.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex items-center gap-4 border-t border-border/30 bg-muted/30">
        <div className="flex items-center gap-6">
          <SkeletonBlock className="h-5 w-14 rounded-md opacity-60 bg-muted" />
          <SkeletonBlock className="h-5 w-10 rounded-md opacity-60 bg-muted" />
          <SkeletonBlock className="h-5 w-10 rounded-md opacity-60 bg-muted" />
        </div>
        <div className="ml-auto">
          <SkeletonBlock className="h-5 w-5 rounded-md opacity-60 bg-muted" />
        </div>
      </div>
    </div>
  );
}

// Matches NotificationRow.tsx
export function NotificationSkeleton({
  isUnread = false,
}: {
  isUnread?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex gap-4 p-4 rounded-xl border border-border/40",
        isUnread ? "bg-primary/5 border-primary/20" : "bg-card",
      )}>
      {isUnread && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}

      <SkeletonAvatar className="h-10 w-10 shrink-0 border border-border/50 shadow-sm" />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 w-full">
            <SkeletonLine className="w-20 h-4 rounded-md opacity-80" />
            <SkeletonLine className="w-40 h-4 rounded-md opacity-60" />
            <SkeletonLine className="w-16 h-4 rounded-md opacity-50" />
          </div>
          <SkeletonLine className="w-10 h-3 rounded-md opacity-30 shrink-0 mt-1" />
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1 opacity-20">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="h-8 w-8 rounded-full bg-muted" />
      </div>
    </div>
  );
}

// Matches StoryCard.tsx (Grid)
export function SkeletonStoryCard() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden h-full flex flex-col shadow-sm">
      {/* Cover Image */}
      <div className="aspect-video w-full relative bg-muted/20">
        <SkeletonBlock className="absolute inset-0 h-full w-full" />
      </div>

      <div className="px-6 pt-5 pb-4 flex-1 flex flex-col">
        <div className="space-y-3 mb-auto">
          <SkeletonLine className="h-5 w-11/12 rounded-md" />
          <div className="space-y-2 pt-1">
            <SkeletonLine className="h-3.5 w-full rounded-md opacity-60" />
            <SkeletonLine className="h-3.5 w-2/3 rounded-md opacity-60" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <SkeletonAvatar className="h-7 w-7 border-border/10 shadow-xs" />
            <div className="space-y-1">
              <SkeletonLine className="w-20 h-3 rounded-md" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-4 w-10 rounded-md opacity-40 bg-muted" />
            <SkeletonBlock className="h-4 w-10 rounded-md opacity-40 bg-muted" />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex items-center justify-between">
        <SkeletonLine className="w-16 h-3.5 rounded-md opacity-40" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-8 rounded-xl opacity-30 bg-muted" />
          <SkeletonBlock className="h-8 w-8 rounded-xl opacity-30 bg-muted" />
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
          <SkeletonAvatar className="h-11 w-11 rounded-full border border-border/10 shadow-sm" />
          <div className="space-y-1.5 flex-1">
            <SkeletonLine className="w-32 h-4 rounded-md" />
            <SkeletonLine className="w-24 h-3 rounded-md opacity-60" />
          </div>
        </div>
        <SkeletonBlock className="h-9 w-24 rounded-full opacity-30 bg-emerald-500/20" />
      </div>

      <div className="space-y-2.5 pt-1">
        <SkeletonLine className="w-full h-5 rounded-md" />
        <SkeletonLine className="w-10/12 h-5 rounded-md" />
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className="h-12 w-full rounded-xl bg-muted/40"
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-border/30">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-8 w-14 rounded-xl opacity-40 bg-muted" />
          <SkeletonBlock className="h-8 w-14 rounded-xl opacity-40 bg-muted" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-24 rounded-full opacity-30 bg-muted" />
          <SkeletonBlock className="h-8 w-8 rounded-xl opacity-30 bg-muted" />
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
        "py-1.5 flex items-end gap-3",
        isSelf ? "flex-row-reverse" : "flex-row",
      )}>
      <SkeletonAvatar className="h-8 w-8 shrink-0 shadow-xs border border-border/20" />

      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isSelf ? "items-end" : "items-start",
        )}>
        {/* Header/Name if needed, but usually bubbles are grouped */}
        <div className="flex items-center gap-2 mb-1.5">
          <SkeletonLine className="w-16 h-3 rounded-md opacity-60" />
          <SkeletonLine className="w-10 h-2.5 rounded-md opacity-30" />
        </div>

        <SkeletonBlock
          className={cn(
            "h-10 w-48 shadow-sm",
            isSelf
              ? "bg-primary/20 rounded-[1.25rem] rounded-tr-[0.5rem]"
              : "bg-muted/60 rounded-[1.25rem] rounded-tl-[0.5rem]",
          )}
        />
        {/* Shimmer for text line */}
        <div className={cn("mt-2", isSelf ? "pr-2" : "pl-2")}>
          <SkeletonLine className="w-24 h-2 rounded-md opacity-20" />
        </div>
      </div>
    </div>
  );
}

// Matches CommentsSection
export function CommentsSkeleton() {
  return (
    <div className="rounded-3xl bg-card border border-border/40 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <SkeletonLine className="h-4 w-48 rounded-md opacity-60" />
      </div>

      <div className="mb-8">
        <div className="flex items-start gap-4">
          <SkeletonAvatar className="h-9 w-9 shrink-0 shadow-xs" />
          <div className="flex-1">
            <div className="flex items-center gap-3 rounded-2xl bg-muted/20 border border-border/40 px-5 py-3">
              <SkeletonLine className="h-4 w-10/12 bg-transparent opacity-30" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 divide-y divide-border/10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn("pt-6", i === 0 && "pt-0")}>
            <div className="flex gap-4">
              <SkeletonAvatar className="h-10 w-10 shrink-0 shadow-xs" />
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SkeletonLine className="h-4 w-32 rounded-md" />
                    <SkeletonLine className="h-3 w-16 rounded-md opacity-40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <SkeletonLine className="w-full h-4 rounded-md opacity-80" />
                  <SkeletonLine className="w-10/12 h-4 rounded-md opacity-80" />
                </div>
                <div className="pt-2 flex items-center gap-4">
                  <SkeletonLine className="h-4 w-20 rounded-md opacity-40" />
                  <SkeletonLine className="h-4 w-12 rounded-md opacity-40" />
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
    <div className="space-y-10 px-6 py-8">
      <div className="flex justify-center">
        <SkeletonLine className="w-32 h-5 rounded-full opacity-20" />
      </div>
      <ChatMessageSkeleton isSelf={false} />
      <ChatMessageSkeleton isSelf={false} />
      <ChatMessageSkeleton isSelf={true} />
      <div className="flex justify-center py-4">
        <SkeletonLine className="w-24 h-5 rounded-full opacity-10" />
      </div>
      <ChatMessageSkeleton isSelf={false} />
      <ChatMessageSkeleton isSelf={true} />
      <ChatMessageSkeleton isSelf={true} />
    </div>
  );
}

// Matches StoryPage.tsx single view
export function StoryPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between mb-2">
          <SkeletonBlock className="h-10 w-32 rounded-full opacity-60" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-11 w-11 rounded-full opacity-40" />
            <SkeletonBlock className="h-11 w-11 rounded-full opacity-40" />
          </div>
        </div>

        <div className="space-y-4">
          <SkeletonLine className="h-10 w-full rounded-xl" />
          <SkeletonLine className="h-10 w-3/4 rounded-xl" />
        </div>

        <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden bg-muted/20 border border-border/40 shadow-xl">
          <SkeletonBlock className="absolute inset-0 h-full w-full opacity-30" />
        </div>

        <div className="rounded-3xl border border-border/40 bg-card overflow-hidden shadow-card p-1">
          <div className="p-8 md:p-10 space-y-8">
            {/* Metadata bar */}
            <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/10 px-5 py-4">
              <SkeletonAvatar className="h-9 w-9" />
              <div className="flex-1 space-y-1.5">
                <SkeletonLine className="w-40 h-4 rounded-md" />
                <SkeletonLine className="w-24 h-3 rounded-md opacity-50" />
              </div>
              <SkeletonBlock className="h-9 w-24 rounded-xl opacity-40" />
            </div>

            {/* Content */}
            <div className="space-y-4 pt-2">
              <SkeletonLine className="w-full h-4 opacity-80" />
              <SkeletonLine className="w-full h-4 opacity-80" />
              <SkeletonLine className="w-full h-4 opacity-80" />
              <SkeletonLine className="w-11/12 h-4 opacity-80" />
              <SkeletonLine className="w-4/5 h-4 opacity-80" />
              <SkeletonLine className="w-full h-4 opacity-80" />
              <SkeletonLine className="w-9/12 h-4 opacity-80" />
            </div>

            {/* Reactions */}
            <div className="pt-8 flex items-center justify-between border-t border-border/20">
              <div className="flex items-center gap-6">
                <SkeletonBlock className="h-12 w-28 rounded-2xl opacity-60 bg-muted" />
                <SkeletonBlock className="h-12 w-16 rounded-2xl opacity-60 bg-muted" />
              </div>
              <SkeletonBlock className="h-12 w-12 rounded-2xl opacity-60 bg-muted" />
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
    <div className="space-y-8">
      <SkeletonPost mediaType="image" hasText={true} />
      <SkeletonPost mediaType="video" hasText={true} />
      <SkeletonPost mediaType="image" hasText={false} />
      <SkeletonPost mediaType="video" hasText={false} />
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
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonPollCard key={i} />
      ))}
    </div>
  );
}

export function NotificationsListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2 sm:p-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <NotificationSkeleton key={i} isUnread={i < 3} />
      ))}
    </div>
  );
}

export function SavedTabsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className="h-9 w-20 rounded-full bg-muted/40"
          />
        ))}
      </div>
      <FeedSkeleton />
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
    <div className="bg-background border-b border-border/40">
      <div className="max-w-4xl mx-auto">
        <div className="hidden sm:flex">
          <div className="flex space-x-1 w-full px-4 py-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex-1 py-2">
                <SkeletonBlock className="h-10 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
        <div className="sm:hidden px-4 py-4">
          <SkeletonBlock className="h-11 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function ProfileHeaderSkeleton({
  isOwnProfile = false,
}: {
  isOwnProfile?: boolean;
}) {
  return (
    <div className="relative overflow-hidden border-0 shadow-lg rounded-xl bg-card">
      <div className="relative h-48 sm:h-56 lg:h-64 bg-muted/40 animate-pulse">
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <SkeletonBlock className="h-9 w-32 rounded-lg bg-black/20 backdrop-blur-md" />
          </div>
        )}
      </div>

      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <SkeletonAvatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-xl" />
              {isOwnProfile && (
                <SkeletonBlock className="absolute bottom-2 right-2 h-10 w-10 rounded-full border-4 border-card shadow-lg bg-primary/20" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-4 sm:pt-0 space-y-2">
              <SkeletonLine className="w-56 h-7 rounded-lg" />
              <SkeletonLine className="w-32 h-3.5 opacity-50 rounded-md" />
            </div>
          </div>

          <div className="flex gap-2 mt-4 sm:mt-0">
            <SkeletonBlock className="h-10 w-32 rounded-full shadow-sm" />
            {!isOwnProfile && (
              <SkeletonBlock className="h-10 w-10 rounded-full shadow-sm bg-muted/40" />
            )}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2.5">
            <SkeletonLine className="w-full h-3.5 opacity-80" />
            <SkeletonLine className="w-10/12 h-3.5 opacity-80" />
          </div>

          <div className="flex flex-wrap gap-4 border-y border-border/10 py-5">
            <SkeletonLine className="w-48 h-3.5 opacity-60" />
            <SkeletonLine className="w-40 h-3.5 opacity-60" />
          </div>

          <div className="grid grid-cols-3 gap-6 px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-2.5">
                <SkeletonLine className="h-5 w-14 mx-auto rounded-md" />
                <SkeletonLine className="h-3 w-16 mx-auto opacity-50 rounded-sm" />
              </div>
            ))}
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
    <div className="min-h-screen bg-background/50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ProfileHeaderSkeleton isOwnProfile={isOwnProfile} />
        <div className="mt-8">
          <ProfileTabsSkeleton isOwnProfile={isOwnProfile} />
        </div>
        <div className="py-10">
          <FeedSkeleton />
        </div>
      </div>
    </div>
  );
}

export function MainAppSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header Placeholder */}
      <div className="lg:hidden px-4 py-4 border-b border-border/40 bg-card/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-11 w-11 rounded-2xl" />
            <div className="space-y-2">
              <SkeletonLine className="w-24 h-4" />
              <SkeletonLine className="w-32 h-3 opacity-50" />
            </div>
          </div>
          <SkeletonBlock className="h-10 w-10 rounded-2xl opacity-40 bg-muted" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Placeholder */}
        <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="h-full px-6 py-10 space-y-12 border-r border-border/40 bg-card/10 animate-pulse">
            <div className="px-4 mb-4">
              <SkeletonBlock className="h-12 w-40 rounded-2xl opacity-80 bg-primary/10" />
            </div>
            <div className="space-y-6 px-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-3">
                  <SkeletonBlock className="h-11 w-11 rounded-2xl opacity-40 bg-muted" />
                  <SkeletonLine className={i % 2 === 0 ? "w-32" : "w-24"} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 lg:pl-72 xl:pr-96">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <FeedSkeleton />
          </div>
        </div>

        {/* Right Panel Placeholder */}
        <div className="hidden xl:flex xl:w-96 xl:flex-col xl:fixed xl:right-0 xl:inset-y-0">
          <div className="h-full px-8 py-10 space-y-10 border-l border-border/40 bg-card/5 animate-pulse">
            <div className="space-y-5">
              <SkeletonLine className="w-40 h-5 opacity-60 rounded-lg" />
              <SkeletonBlock className="h-56 rounded-3xl opacity-30 bg-muted shadow-sm" />
            </div>
            <div className="space-y-5">
              <SkeletonLine className="w-32 h-5 opacity-60 rounded-lg" />
              <SkeletonBlock className="h-40 rounded-3xl opacity-30 bg-muted shadow-sm" />
            </div>
            <div className="space-y-5">
              <SkeletonLine className="w-48 h-5 opacity-60 rounded-lg" />
              <div className="space-y-4">
                <SkeletonSmallRow />
                <SkeletonSmallRow />
                <SkeletonSmallRow />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonSmallRow() {
  return (
    <div className="flex items-center gap-3">
      <SkeletonAvatar className="h-10 w-10 shrink-0 opacity-40" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine className="w-3/4 h-3.5 opacity-60" />
        <SkeletonLine className="w-1/2 h-2.5 opacity-40" />
      </div>
    </div>
  );
}
