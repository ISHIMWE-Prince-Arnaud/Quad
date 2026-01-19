import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        <div className="flex items-center gap-3 rounded-full bg-[#0f172a]/70 border border-white/5 px-4 py-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder || "Add a comment..."}
            className="h-auto border-0 bg-transparent px-0 py-0 text-[13px] text-[#e2e8f0] placeholder:text-[#64748b] focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={2000}
            autoFocus={autoFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSubmit();
              }
            }}
          />

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={pending || !text.trim()}
            className="text-[13px] font-semibold text-blue-500 disabled:opacity-50">
            {pending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
