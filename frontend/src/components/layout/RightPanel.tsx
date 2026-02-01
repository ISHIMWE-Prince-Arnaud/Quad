import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  FileText,
  MessageCircle,
  BarChart3,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { cn } from "@/lib/utils";
import { logError } from "@/lib/errorHandling";
import { useAuthStore } from "@/stores/authStore";
import { ChatService } from "@/services/chatService";
import type { ChatAuthor } from "@/types/chat";

export function RightPanel() {
  return (
    <aside className="h-full bg-[#0a0c10] border-l border-white/5 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-6 p-6 flex-1 min-h-0">
        <QuickCreate />
        <ActiveChatsMini />
        <div className="mt-auto flex flex-col gap-4">
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <ThemeSelector />
          </div>
          <AccountMiniCard />
        </div>
      </div>
    </aside>
  );
}

function QuickCreate() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Quick Create</h2>
        <Link
          to="/app/create"
          className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors"
          aria-label="Go to create page">
          All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          asChild
          className="w-full justify-start rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] text-white border border-white/5 shadow-none">
          <Link to="/app/create/post" aria-label="Create a post">
            <FileText className="h-4 w-4" />
            Post
          </Link>
        </Button>

        <Button
          asChild
          className="w-full justify-start rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] text-white border border-white/5 shadow-none">
          <Link to="/app/create/poll" aria-label="Create a poll">
            <BarChart3 className="h-4 w-4" />
            Poll
          </Link>
        </Button>

        <Button
          asChild
          className="w-full justify-start rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] text-white border border-white/5 shadow-none">
          <Link to="/app/create/story" aria-label="Create a story">
            <Camera className="h-4 w-4" />
            Story
          </Link>
        </Button>
      </div>
    </section>
  );
}

function ActiveChatsMini() {
  const { user } = useAuthStore();
  const [authors, setAuthors] = useState<ChatAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        if (!user) {
          if (!cancelled) {
            setAuthors([]);
            setLoading(false);
          }
          return;
        }

        setLoading(true);
        const res = await ChatService.getMessages({ limit: 30 });
        if (!res.success || !Array.isArray(res.data)) {
          if (!cancelled) setAuthors([]);
          return;
        }

        const seen = new Set<string>();
        const next: ChatAuthor[] = [];

        for (const msg of res.data) {
          const a = msg?.author;
          if (!a) continue;

          const key = a.clerkId || a.username || a.email;
          if (!key || seen.has(key)) continue;

          seen.add(key);
          next.push(a);
          if (next.length >= 3) break;
        }

        if (!cancelled) setAuthors(next);
      } catch (error) {
        logError(error, { component: "RightPanel", action: "loadChatAuthors" });
        if (!cancelled) setAuthors([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const label = useMemo(() => {
    if (loading) return "Loading…";
    return "Open Chat";
  }, [loading]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Active Chats</h2>
        <span className="text-xs font-medium text-[#64748b]">
          {authors.length}/3
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <div className="flex -space-x-2">
          {authors.length > 0
            ? authors.map((a) => (
                <Avatar
                  key={a.clerkId || a.username || a.email}
                  className="h-9 w-9 border-2 border-[#0a0c10]">
                  <AvatarImage src={a.profileImage} alt={a.username} />
                  <AvatarFallback className="bg-[#1e293b] text-white text-xs font-bold">
                    {(a.username || a.email || "U")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))
            : [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 border-[#0a0c10] bg-white/[0.05]",
                    i > 0 && "-ml-2",
                  )}
                />
              ))}
        </div>

        <Button
          asChild
          size="sm"
          className="rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-[0_10px_20px_rgba(37,99,235,0.25)]">
          <Link to="/app/chat" aria-label="Open chat">
            <MessageCircle className="h-4 w-4" />
            {label}
          </Link>
        </Button>
      </div>
    </section>
  );
}

function AccountMiniCard() {
  const { user, logout } = useAuthStore();
  const { signOut } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || "User";

  const profileHref = user?.username
    ? `/app/profile/${user.username}`
    : "/app/feed";

  const handleSignOut = async () => {
    try {
      logout();
      await signOut();
      setIsDialogOpen(false);
    } catch (error) {
      logError(error, { component: "RightPanel", action: "signOut" });
    }
  };

  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <Link to={profileHref} className="shrink-0" aria-label="Go to profile">
          <Avatar className="h-11 w-11 border border-white/10">
            <AvatarImage src={user?.profileImage} alt={displayName} />
            <AvatarFallback className="bg-[#1e293b] text-white font-bold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">
            {displayName}
          </p>
          <p className="text-xs text-[#94a3b8] truncate">
            {user?.username ? `@${user.username}` : user?.email || ""}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-destructive/90 hover:text-destructive hover:bg-destructive/10"
              aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f121a] border-border/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Log Out
              </DialogTitle>
              <DialogDescription className="text-[#64748b]">
                This will end your session on this device. You will need to sign
                in again to continue.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-[#64748b] hover:text-white hover:bg-white/5">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleSignOut()}
                className="bg-destructive hover:bg-destructive/90">
                Log Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
