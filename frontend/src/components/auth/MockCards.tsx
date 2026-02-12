import {
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  Bell,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Mock Post Card ---
export const MockPostCard = () => (
  <Card className="w-full bg-card border-border/40 rounded-[2rem] overflow-hidden shadow-sm">
    <CardHeader className="pb-3 px-6 pt-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              JD
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-bold">John Doe</div>
            <div className="text-[10px] text-muted-foreground font-medium">
              @johndoe • 2h
            </div>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent className="px-6 pb-4 space-y-3">
      <p className="text-[13px] leading-relaxed text-foreground/90 font-medium">
        Just launched the new Quad beta! The infinite carousel is looking
        absolutely stunning. 🚀 #webdev #uiux
      </p>
      <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl border border-border/40 flex items-center justify-center">
        <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">
          Post Preview
        </div>
      </div>
    </CardContent>
    <CardFooter className="px-6 py-3 flex items-center gap-4 border-t border-border/40 bg-muted/20">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Heart className="h-3.5 w-3.5" />
        <span className="text-[11px] font-bold">128</span>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="text-[11px] font-bold">24</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
        <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </CardFooter>
  </Card>
);

// --- Mock Poll Card ---
export const MockPollCard = () => (
  <Card className="w-full bg-card border-border/40 rounded-3xl overflow-hidden shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            ACTIVE POLL
          </span>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          1.2k Votes
        </span>
      </div>

      <h3 className="text-sm font-bold text-foreground leading-snug mb-4">
        Which feature are you most excited for in Quad?
      </h3>

      <div className="space-y-2">
        {[
          { label: "Infinite Stories", percent: 45, selected: true },
          { label: "Real-time Chat", percent: 30, selected: false },
          { label: "Custom Themes", percent: 25, selected: false },
        ].map((opt, i) => (
          <div
            key={i}
            className="relative h-10 w-full rounded-xl border border-border/40 bg-muted/30 overflow-hidden">
            <div
              className={cn(
                "absolute inset-y-0 left-0 transition-all duration-1000",
                opt.selected ? "bg-primary/20" : "bg-muted-foreground/10",
              )}
              style={{ width: `${opt.percent}%` }}
            />
            <div className="relative h-full flex items-center justify-between px-4">
              <span className="text-[12px] font-semibold text-foreground">
                {opt.label}
              </span>
              <span className="text-[11px] font-bold tabular-nums">
                {opt.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold">84</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black text-primary">
          MY VOTE: CHOICE A
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- Mock Story Card ---
export const MockStoryCard = () => (
  <Card className="w-full bg-card border-border/40 rounded-2xl overflow-hidden shadow-sm">
    <div className="aspect-video w-full bg-gradient-to-tr from-secondary/30 to-primary/30 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
          Story Cover
        </div>
      </div>
      <Badge className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border-white/20 text-[10px] font-bold">
        5 MIN READ
      </Badge>
    </div>
    <CardContent className="p-5">
      <h3 className="text-base font-bold text-foreground leading-tight mb-2 line-clamp-1">
        Redefining Digital Connection
      </h3>
      <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
        In a world of noise, Quad focuses on what matters: structured
        conversation and meaningful interaction...
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[8px] bg-secondary/20 text-secondary-foreground font-bold">
              AI
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] font-bold text-foreground">
            alice_dev
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3 w-3" />
            <span className="text-[10px] font-bold">54</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span className="text-[10px] font-bold">12</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- Mock Chat Card ---
export const MockChatCard = () => (
  <Card className="w-full bg-card border-border/40 rounded-3xl overflow-hidden shadow-sm p-5 space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
        LIVE CHAT
      </span>
    </div>

    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 shrink-0 border border-border/40">
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
          S
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold">Sarah</span>
          <span className="text-[9px] text-muted-foreground">10:42 AM</span>
        </div>
        <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-none border border-border/40">
          <p className="text-[12px] leading-relaxed">
            The new UI is insane! Love the blur effects. 😍
          </p>
        </div>
      </div>
    </div>

    <div className="flex items-start gap-3 flex-row-reverse">
      <Avatar className="h-8 w-8 shrink-0 border border-border/40">
        <AvatarFallback className="bg-secondary/10 text-secondary-foreground text-[10px] font-bold">
          ME
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 items-end max-w-[80%]">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] text-muted-foreground italic">
            Sending...
          </span>
          <span className="text-[11px] font-bold">You</span>
        </div>
        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-2xl rounded-tr-none shadow-sm">
          <p className="text-[12px] leading-relaxed">
            Glad you like it! Many more features coming soon. 🚀
          </p>
        </div>
      </div>
    </div>
  </Card>
);

// --- Mock Notification Card ---
export const MockNotificationCard = () => (
  <Card className="w-full bg-card border-border/40 rounded-2xl overflow-hidden shadow-sm p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bell className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Activity
        </span>
      </div>
      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
    </div>

    <div className="flex items-center gap-3 bg-primary/5 p-2 rounded-xl border border-primary/10">
      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
        <UserPlus className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] leading-snug">
          <span className="font-bold">@alex_king</span> followed you
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          2 minutes ago
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-xl border border-border/40">
      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
        <Heart className="h-4 w-4 text-orange-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] leading-snug">
          <span className="font-bold">TeamQuad</span> liked your story
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          15 minutes ago
        </p>
      </div>
    </div>
  </Card>
);

// --- Mock Profile Card ---
export const MockProfileCard = () => (
  <Card className="w-full bg-card border-border/40 rounded-[2rem] overflow-hidden shadow-sm">
    <div className="h-16 w-full bg-gradient-to-r from-primary to-secondary opacity-80" />
    <div className="px-6 -mt-8 flex flex-col items-center text-center">
      <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
        <AvatarFallback className="text-xl bg-primary/10 text-primary font-black">
          QU
        </AvatarFallback>
      </Avatar>
      <div className="mt-3">
        <h3 className="text-base font-bold text-foreground">Quad Official</h3>
        <p className="text-[11px] text-primary font-bold">@QuadHQ</p>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed max-w-[200px]">
        Empowering student communities through structured collaboration and
        expression. 🎓✨
      </p>

      <div className="w-full flex justify-center gap-6 mt-4 pb-6 border-b border-border/40">
        <div className="text-center">
          <div className="text-[13px] font-black">1.2k</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
            Followers
          </div>
        </div>
        <div className="text-center">
          <div className="text-[13px] font-black">420</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
            Following
          </div>
        </div>
        <div className="text-center">
          <div className="text-[13px] font-black">84</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
            Posts
          </div>
        </div>
      </div>
    </div>
  </Card>
);
