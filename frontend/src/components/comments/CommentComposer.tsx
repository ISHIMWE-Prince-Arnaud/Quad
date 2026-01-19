import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AutoExpandingTextarea } from "@/components/ui/auto-expanding-textarea";
import { CommentService } from "@/services/commentService";
import { useAuthStore } from "@/stores/authStore";
import type { Comment } from "@/types/comment";
import toast from "react-hot-toast";

interface CommentComposerProps {
  contentType: "post" | "story" | "poll";
  contentId: string;
  placeholder?: string;
  autoFocus?: boolean;
  onCreated?: (comment: Comment) => void;
}

export function CommentComposer({
  contentType,
  contentId,
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
      });
      if (!res.success)
        throw new Error(res.message || "Failed to post comment");
      setText("");
      onCreated?.(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to post comment";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={user?.profileImage} />
        <AvatarFallback className="bg-white/5 text-white/80">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-end gap-3 rounded-2xl bg-[#0f172a]/70 border border-white/5 px-4 py-2 transition-colors focus-within:border-white/10 focus-within:bg-[#0f172a]">
          <AutoExpandingTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder || "Add a comment..."}
            className="min-h-[24px] border-0 bg-transparent px-0 py-0 text-[13px] leading-5 text-[#e2e8f0] placeholder:text-[#64748b] focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={2000}
            autoFocus={autoFocus}
            minHeight={24}
            maxHeight={140}
            rows={1}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (e.shiftKey) return;
              if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.isComposing)
                return;

              e.preventDefault();
              void handleSubmit();
            }}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void handleSubmit()}
            loading={pending}
            disabled={pending || !text.trim()}
            className="h-8 px-3 rounded-full text-[13px] font-semibold text-blue-400 hover:text-white hover:bg-white/5 disabled:opacity-50">
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
