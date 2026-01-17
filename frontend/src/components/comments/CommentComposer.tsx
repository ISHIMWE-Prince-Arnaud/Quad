import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentService } from "@/services/commentService";
import { useAuthStore } from "@/stores/authStore";
import { ImageIcon, AtSign, Smile } from "lucide-react";
import toast from "react-hot-toast";

interface CommentComposerProps {
  contentType: "post" | "story" | "poll";
  contentId: string;
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onCreated?: () => void;
}

export function CommentComposer({
  contentType,
  contentId,
  parentId,
  placeholder,
  autoFocus,
  onCreated,
}: CommentComposerProps) {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    const value = text.trim();
    if (!value) return;
    if (pending) return;
    setPending(true);
    try {
      const res = await CommentService.create({
        contentType,
        contentId,
        text: value,
        parentId,
      });
      if (!res.success)
        throw new Error(res.message || "Failed to post comment");
      setText("");
      onCreated?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to post comment";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative rounded-2xl bg-[#0F1117] border border-border/40 p-4 shadow-sm">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder || "Write a constructive comment..."}
            className="min-h-[60px] resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 shadow-none"
            maxLength={2000}
            autoFocus={autoFocus}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-muted-foreground">
              <button
                type="button"
                className="hover:text-foreground transition-colors">
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="hover:text-foreground transition-colors">
                <AtSign className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="hover:text-foreground transition-colors">
                <Smile className="h-5 w-5" />
              </button>
            </div>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={pending || !text.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-9 font-medium transition-all">
              {pending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
