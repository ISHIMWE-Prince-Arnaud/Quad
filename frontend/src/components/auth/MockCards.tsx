import { NotificationRow } from "@/pages/notifications/NotificationRow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  EyeOff,
  Camera,
  Calendar,
} from "lucide-react";
import type { ApiNotification } from "@/types/api";

// --- Product-identical cards for auth preview (reuse in-app components) ---
export const MockPostCard = () => {
  return (
    <div className="w-full rounded-[2rem] bg-card border border-border/40 overflow-hidden p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10 shrink-0 border border-border/40 bg-muted/20">
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
          <span className="text-[15px] font-bold text-foreground leading-tight tracking-tight">
            johndoe
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 font-medium">
            <span className="text-primary">@johndoe</span>
            <span className="opacity-50">·</span>
            <span>2 hours ago</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed text-foreground/90 tracking-tight">
          Just shipped a small UI upgrade. Tag someone who cares about clean UX:
          <span className="text-primary ml-1">@alice_dev</span> 🔥
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
    <div className="w-full rounded-3xl bg-card border border-border/40 overflow-hidden p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0 border border-border/40 bg-muted/20">
            <AvatarImage
              className="object-cover"
              src="https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?q=80&w=581&auto=format&fit=crop"
              alt="@princearnaud"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              PA
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-foreground leading-tight truncate">
              princearnaud
            </span>
            <div className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate">
              2 hours ago
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Expires in 24 hours
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-foreground leading-snug">
          Which Quad feature should we polish next?
        </h3>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Voted Option (Feed - 45%) */}
        <div className="relative flex h-11 w-full items-center justify-between rounded-full bg-muted/30 text-[13px] font-semibold border-[1.5px] border-primary overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary"
            style={{ width: "45%" }}
          />
          <div className="relative z-10 flex w-full justify-between items-center px-4">
            <span className="text-white">Feed</span>
            <span className="text-foreground dark:text-white">45%</span>
          </div>
        </div>

        {/* Unvoted Option (Chat - 30%) */}
        <div className="relative flex h-11 w-full items-center justify-between rounded-full bg-muted/20 text-[13px] font-semibold overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary/20 dark:bg-primary/10"
            style={{ width: "30%" }}
          />
          <div className="relative z-10 flex w-full justify-between items-center px-4">
            <span className="text-white">Chat</span>
            <span className="text-foreground dark:text-white">30%</span>
          </div>
        </div>

        {/* Unvoted Option (Stories - 25%) */}
        <div className="relative flex h-11 w-full items-center justify-between rounded-full bg-muted/20 text-[13px] font-semibold overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary/20 dark:bg-primary/10"
            style={{ width: "25%" }}
          />
          <div className="relative z-10 flex w-full justify-between items-center px-4">
            <span className="text-white">Stories</span>
            <span className="text-foreground dark:text-white">25%</span>
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
  return (
    <div className="w-full rounded-3xl bg-card border border-border/40 overflow-hidden transition-colors">
      {/* Full-width cover image */}
      <div className="w-full h-56 bg-muted relative">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
          alt="Story cover"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground leading-snug mb-2 line-clamp-1">
          Redefining digital connection
        </h3>

        {/* Excerpt */}
        <p className="text-sm leading-relaxed text-foreground/70 dark:text-muted-foreground mb-5 line-clamp-2">
          Quad keeps things fast, calm, and structured — so your community can
          actually move.
        </p>

        {/* Engagement Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 shrink-0 border border-border/40 bg-muted/20">
              <AvatarImage
                className="object-cover"
                src="https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?q=80&w=876&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="@alice_dev"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center text-sm font-bold text-foreground">
              <span className="truncate max-w-24">alice_dev</span>
              <span className="text-muted-foreground ml-1.5 font-medium">
                · 5 min read
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity">
              <Heart size={18} className="fill-current" />
              <span>54</span>
            </div>
            <div className="flex items-center gap-2 text-blue-500 font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity">
              <MessageCircle size={18} className="fill-current" />
              <span>12</span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-muted-foreground/80">
            5 hours ago
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <Share2 size={20} />
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 cursor-pointer hover:bg-amber-500/20 transition-colors">
              <Bookmark size={20} className="fill-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Mock Chat Card ---
// Self-contained mini conversation that mirrors the production ChatMessageList UI structure.
export const MockChatCard = () => {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Date Separator Header */}
      <div className="flex items-center justify-center py-4 border-b border-border/40 bg-muted/20">
        <div className="text-sm font-semibold text-muted-foreground/70 bg-background/50 border border-border/50 px-4 py-1 rounded-full">
          Today
        </div>
      </div>

      {/* Messages area */}
      <div className="px-5 py-6 space-y-6">
        {/* Received messages - sarah */}
        <div className="flex items-end gap-3 justify-start">
          <Avatar className="h-10 w-10 shrink-0 border border-border/40 bg-muted mb-1">
            <AvatarImage
              className="object-cover"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop"
              alt="@sarah"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              SR
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col max-w-[75%] min-w-0 items-start">
            <div className="flex items-center gap-2 mb-2 ml-2">
              <span className="text-sm font-semibold text-foreground">
                sarah
              </span>
              <span className="text-xs text-muted-foreground/60 tabular-nums">
                2:08 PM
              </span>
            </div>
            <div className="relative w-fit max-w-full break-words rounded-[1.25rem] px-4 py-2.5 shadow-sm bg-muted text-foreground border border-transparent">
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                The new UI is insane! 🚀
              </div>
            </div>
          </div>
        </div>

        {/* Received message - eddy */}
        <div className="flex items-end gap-3 justify-start">
          <Avatar className="h-10 w-10 shrink-0 shadow-sm border border-border/40 bg-muted mb-1">
            <AvatarImage
              className="object-cover"
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop"
              alt="@eddy"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              ED
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col max-w-[75%] min-w-0 items-start">
            <div className="flex items-center gap-2 mb-1.5 ml-2">
              <span className="text-sm font-bold text-foreground">eddy</span>
              <span className="text-xs font-semibold text-muted-foreground/60">
                2:09 PM
              </span>
            </div>
            <div className="relative w-fit max-w-full break-words rounded-3xl rounded-tl-lg px-5 py-3 bg-muted text-foreground border border-transparent">
              <div className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap break-words">
                Clean, fast, and it just flows
              </div>
            </div>
          </div>
        </div>

        {/* Sent message - You */}
        <div className="flex items-end gap-3 justify-end">
          <div className="flex flex-col max-w-[75%] min-w-0 items-end">
            <div className="flex items-center gap-2 mb-1.5 mr-2">
              <span className="text-xs font-semibold text-muted-foreground/60">
                2:13 PM
              </span>
              <span className="text-sm font-bold text-foreground">You</span>
            </div>
            <div className="relative w-fit max-w-full break-words rounded-[1.25rem] px-4 py-2.5 shadow-sm bg-primary text-primary-foreground">
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                Appreciate it! Shipping more polish soon 🎨
              </div>
            </div>
          </div>
          <Avatar className="h-8 w-8 shrink-0 border border-border/40 bg-muted mb-1">
            <AvatarImage
              className="object-cover"
              src="https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=800&auto=format&fit=crop"
              alt="You"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
              PA
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Composer bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-border/40 bg-card">
        <div className="flex-1 rounded-full bg-transparent border border-border/60 px-5 py-3 text-sm font-semibold text-muted-foreground/50 hover:bg-muted/10 transition-colors">
          Type a message...
        </div>
        <div className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors">
          <Send className="h-5 w-5 text-muted-foreground/60" />
        </div>
      </div>
    </div>
  );
};

// --- Mock Notification Card ---
export const MockNotificationCard = () => {
  const now = new Date();

  const notifications: ApiNotification[] = [
    {
      id: "auth-preview-notif-1",
      userId: "auth-preview-user",
      type: "reaction",
      message: "reacted to your post",
      isRead: false,
      createdAt: now.toISOString(),
      actor: {
        clerkId: "auth-actor-1",
        username: "alex_king",
        displayName: "Alex King",
        profileImage:
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&auto=format&fit=crop",
      },
      contentType: "post",
    },
    {
      id: "auth-preview-notif-2",
      userId: "auth-preview-user",
      type: "follow",
      message: "started following you",
      isRead: false,
      createdAt: new Date(now.getTime() - 60 * 1000).toISOString(),
      actor: {
        clerkId: "auth-actor-2",
        username: "sarah_w",
        displayName: "Sarah W",
        profileImage:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop",
      },
      contentType: "user",
    },
    {
      id: "auth-preview-notif-3",
      userId: "auth-preview-user",
      type: "comment",
      message: "commented on your story",
      isRead: false,
      createdAt: new Date(now.getTime() - 7 * 60 * 1000).toISOString(),
      actor: {
        clerkId: "auth-actor-3",
        username: "eddy",
        displayName: "Eddy",
        profileImage:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop",
      },
      contentType: "story",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          onNavigate={() => {}}
          onMarkAsRead={() => {}}
          onDelete={() => {}}
        />
      ))}
    </div>
  );
};

// --- Mock Profile Card ---
export const MockProfileCard = () => {
  return (
    <div className="w-full rounded-[28px] bg-card border border-border/40 overflow-hidden transition-colors text-left pb-6">
      {/* Cover Image Area */}
      <div className="w-full h-[140px] bg-blue-600 relative sm:h-[160px]">
        {/* Mock background cover image - or solid blue as requested */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-500 opacity-90" />

        <button className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-md text-white border border-white/20 transition-colors cursor-pointer z-10">
          <Camera size={14} className="stroke-[2.5]" />
          <span className="text-[12px] font-bold">Edit Cover</span>
        </button>
      </div>

      <div className="px-6 text-left">
        {/* Avatar and Info Row */}
        <div className="flex items-end justify-between -mt-16 relative z-10 mb-5">
          <div className="flex items-end gap-4">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 border-4 border-card bg-muted relative z-20">
                <AvatarImage
                  className="object-cover"
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&auto=format&fit=crop"
                  alt="@alex_design"
                />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  AD
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 -right-1 h-8 w-8 rounded-full bg-card flex items-center justify-center p-0 shadow-lg border-2 border-card">
                <div className="bg-muted rounded-full p-1.5 hover:bg-muted/80 transition-colors">
                  <Camera size={14} className="text-foreground stroke-[2.5]" />
                </div>
              </button>
            </div>

            <div className="flex-1 min-w-0 pt-2 pb-1">
              <h1 className="text-2xl font-bold text-foreground truncate">
                Alex Designer
              </h1>
              <p className="text-muted-foreground text-sm">@alex_design</p>
            </div>
          </div>

          <div className="pb-1 shrink-0">
            <button className="px-5 py-1.5 rounded-full border-[1.5px] border-border/60 text-[13px] font-bold text-foreground bg-transparent hover:bg-muted/30 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Joined Date */}
        <div className="flex items-center justify-start gap-2 text-muted-foreground/90 font-semibold text-sm mb-6">
          <Calendar size={15} className="stroke-[2.5]" />
          <span>Joined March 2025</span>
        </div>

        {/* Separator Divider */}
        <div className="h-px bg-border/40 w-full mb-6" />

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 text-center mt-2 -mx-6 px-6 py-5 border-t border-border/40">
          <div className="text-center">
            <div className="text-primary text-lg font-extrabold leading-none tabular-nums">
              1.2k
            </div>
            <div className="mt-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              Reactions
            </div>
          </div>
          <div className="text-center">
            <div className="text-primary text-lg font-extrabold leading-none tabular-nums">
              890
            </div>
            <div className="mt-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              Followers
            </div>
          </div>
          <div className="text-center">
            <div className="text-primary text-lg font-extrabold leading-none tabular-nums">
              345
            </div>
            <div className="mt-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              Following
            </div>
          </div>
        </div>

        {/* Content Tabs Section */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="rounded-2xl border border-primary/60 ring-1 ring-primary/30 bg-primary/5 px-4 py-4 text-center shadow-sm">
            <div className="text-xl font-extrabold leading-none tabular-nums text-primary mb-1">
              12
            </div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-primary">
              Posts
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4 text-center shadow-sm">
            <div className="text-xl font-extrabold leading-none tabular-nums text-foreground mb-1">
              4
            </div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              Stories
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4 text-center shadow-sm">
            <div className="text-xl font-extrabold leading-none tabular-nums text-foreground mb-1">
              2
            </div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              Polls
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4 text-center shadow-sm">
            <div className="text-xl font-extrabold leading-none tabular-nums text-foreground mb-1">
              18
            </div>
            <div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              Saved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
