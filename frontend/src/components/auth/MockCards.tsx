import { StoryCard } from "@/components/stories/StoryCard";
import { NotificationRow } from "@/pages/notifications/NotificationRow";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  EyeOff,
} from "lucide-react";
import type { Story } from "@/types/story";
import type { ApiNotification } from "@/types/api";

const ISO_5H_AGO = "2026-02-13T10:00:00.000Z";
const ISO_2M_AGO = "2026-02-13T14:58:00.000Z";
const ISO_250D_AGO = "2025-06-08T12:00:00.000Z";

// --- Product-identical cards for auth preview (reuse in-app components) ---
export const MockPostCard = () => {
  return (
    <div className="w-full rounded-3xl bg-card border border-border/40 overflow-hidden shadow-sm p-5 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-11 w-11 shrink-0 border border-border/40 shadow-sm bg-muted/20">
          <AvatarImage
            className="object-cover"
            src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80"
            alt="@johndoe"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            JD
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-foreground leading-none tracking-tight">
            johndoe
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium">
            <span className="text-primary">@johndoe</span>
            <span className="opacity-50">·</span>
            <span>2 hours ago</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-base sm:text-lg font-extrabold text-foreground leading-snug tracking-tight">
          Just shipped a small UI upgrade. Tag someone who cares about clean UX:
          @alice_dev 🔥
        </p>
      </div>

      {/* Media */}
      <div className="mb-5 rounded-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80"
          alt="Post media"
          className="w-full h-auto max-h-80 object-cover rounded-2xl"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity">
            <Heart size={20} className="fill-current" />
            <span>128</span>
          </div>
          <div className="flex items-center gap-2 text-blue-500 font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity">
            <MessageCircle size={20} className="fill-current" />
            <span>24</span>
          </div>
          <div className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <Share2 size={20} />
          </div>
        </div>
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 cursor-pointer hover:bg-amber-500/20 transition-colors">
          <Bookmark size={20} className="fill-current" />
        </div>
      </div>
    </div>
  );
};

// --- Mock Poll Card ---
export const MockPollCard = () => {
  return (
    <div className="w-full rounded-3xl bg-card border border-border/40 overflow-hidden shadow-sm p-5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0 border border-border/40 shadow-sm bg-muted/20">
          <AvatarImage
            className="object-cover"
            src="https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?q=80&w=581&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="@princearnaud"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            PA
          </AvatarFallback>
        </Avatar>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-foreground leading-none tracking-tight">
              princearnaud
            </span>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              2 hours ago
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Expires in 24 hours
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <h3 className="text-lg sm:text-lg font-extrabold text-foreground leading-snug tracking-tight">
          Which Quad feature should we polish next?
        </h3>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Voted Option (Feed - 45%) */}
        <div className="relative flex h-[52px] w-full items-center justify-between rounded-full bg-muted/30 px-5 text-sm font-extrabold border-2 border-primary overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary"
            style={{ width: "45%" }}
          />
          <div className="relative z-10 flex w-full justify-between items-center text-primary-foreground dark:text-foreground">
            <span>Feed</span>
            <span>45%</span>
          </div>
        </div>

        {/* Unvoted Option (Chat - 30%) */}
        <div className="relative flex h-[52px] w-full items-center justify-between rounded-full bg-muted/30 px-5 text-sm font-extrabold overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary/80 dark:bg-primary/40"
            style={{ width: "30%" }}
          />
          <div className="relative z-10 flex w-full justify-between items-center text-primary-foreground dark:text-foreground">
            <span>Chat</span>
            <span>30%</span>
          </div>
        </div>

        {/* Unvoted Option (Stories - 25%) */}
        <div className="relative flex h-[52px] w-full items-center justify-between rounded-full bg-muted/30 px-5 text-sm font-extrabold overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary/80 dark:bg-primary/40"
            style={{ width: "25%" }}
          />
          <div className="relative z-10 flex w-full justify-between items-center text-primary-foreground dark:text-foreground">
            <span>Stories</span>
            <span>25%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity">
            <Heart size={20} className="fill-current" />
            <span>84</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm cursor-pointer hover:text-foreground transition-colors">
            <Users size={20} className="fill-current" />
            <span>1200</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <EyeOff size={16} />
            ANONYMOUS
          </div>
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 cursor-pointer hover:bg-amber-500/20 transition-colors">
            <Bookmark size={20} className="fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Mock Story Card ---
export const MockStoryCard = () => {
  const story: Story = {
    _id: "auth-preview-story",
    author: {
      clerkId: "auth-preview-user",
      username: "alice_dev",
      email: "alice@quad.test",
      profileImage: undefined,
    },
    title: "Redefining digital connection",
    content:
      "<p>Quad keeps things fast, calm, and structured — so your community can actually move.</p>",
    coverImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    status: "published",
    readTime: 5,
    reactionsCount: 54,
    commentsCount: 12,
    createdAt: ISO_5H_AGO,
    updatedAt: ISO_5H_AGO,
  };

  return <StoryCard story={story} />;
};

// --- Mock Chat Card ---
// Self-contained mini conversation that mirrors the production ChatMessageList UI.
export const MockChatCard = () => {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40 bg-muted/30">
        <div className="h-7 w-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-primary/80" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          General Chat
        </span>
        <span className="ml-auto text-xs text-muted-foreground">3 online</span>
      </div>

      {/* Messages area */}
      <div className="px-5 py-4 space-y-1">
        {/* Day separator */}
        <div className="flex items-center justify-center py-2">
          <div className="h-px flex-1 bg-border/60" />
          <div className="mx-3 text-xs font-medium text-muted-foreground/70 bg-background/70 border border-border/50 px-3 py-1 rounded-full tabular-nums">
            Today
          </div>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        {/* Received message – sarah */}
        <div className="flex items-start gap-3 justify-start">
          <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-border/40">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              S
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col max-w-[75%] min-w-0 items-start">
            <div className="flex items-center justify-start gap-2 mb-2 w-full">
              <span className="text-sm font-semibold text-foreground">
                sarah
              </span>
              <span className="text-xs text-muted-foreground/60 tabular-nums">
                2:08 PM
              </span>
            </div>
            <div className="relative w-fit max-w-full break-words rounded-2xl px-4 py-2.5 shadow-sm bg-card text-foreground border border-border/60 dark:bg-muted dark:border-transparent">
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                The new UI is insane! 🚀
              </div>
            </div>
          </div>
        </div>

        {/* Received follow-up – sarah (no avatar, grouping) */}
        <div className="mt-1.5">
          <div className="flex items-start gap-3 justify-start">
            <div className="w-9 shrink-0" />
            <div className="flex flex-col max-w-[75%] min-w-0 items-start">
              <div className="relative w-fit max-w-full break-words rounded-2xl px-4 py-2.5 shadow-sm bg-card text-foreground border border-border/60 dark:bg-muted dark:border-transparent">
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  Clean, fast, and it just flows
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sent message – you */}
        <div className="mt-4">
          <div className="flex items-start gap-3 justify-end">
            <div className="flex flex-col max-w-[75%] min-w-0 items-end">
              <div className="flex items-center justify-end gap-2 mb-2 w-full">
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                  2:13 PM
                </span>
                <span className="text-sm font-bold text-foreground">You</span>
              </div>
              <div className="relative w-fit max-w-full break-words rounded-2xl px-4 py-2.5 shadow-sm bg-primary text-primary-foreground shadow-primary/20 border border-primary/10">
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  Appreciate it! Shipping more polish soon 🎨
                </div>
              </div>
            </div>
            <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-border/40">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                Y
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Composer bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border/40 bg-muted/20">
        <div className="flex-1 rounded-xl bg-background border border-border/60 px-4 py-2 text-sm text-muted-foreground/50">
          Type a message…
        </div>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Send className="h-3.5 w-3.5 text-primary/60" />
        </div>
      </div>
    </div>
  );
};

// --- Mock Notification Card ---
export const MockNotificationCard = () => {
  const notification: ApiNotification = {
    id: "auth-preview-notification",
    userId: "auth-preview-user",
    type: "follow",
    message: "followed you",
    isRead: false,
    createdAt: ISO_2M_AGO,
    actor: {
      clerkId: "auth-preview-actor-2",
      username: "alex_king",
      displayName: "Alex King",
      profileImage: undefined,
    },
    contentType: "user",
    contentId: "alex_king",
  };

  return (
    <div className="w-full">
      <NotificationRow
        notification={notification}
        onNavigate={() => {}}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};

// --- Mock Profile Card ---
export const MockProfileCard = () => {
  const user = {
    clerkId: "auth-preview-user",
    username: "QuadHQ",
    displayName: "Quad Official",
    profileImage: undefined,
    bio: "Empowering student communities through structured collaboration and expression.",
    followersCount: 1200,
    followingCount: 420,
    postsCount: 84,
    createdAt: ISO_250D_AGO,
  };

  return (
    <ProfileHeader
      user={user as never}
      isOwnProfile
      isFollowing={false}
      activeTab="posts"
      onTabChange={() => {}}
      tabCounts={{ posts: 84, stories: 12, polls: 6 } as never}
      onFollow={() => {}}
      onUnfollow={() => {}}
      onEditProfile={() => {}}
      onUserUpdate={() => {}}
    />
  );
};
