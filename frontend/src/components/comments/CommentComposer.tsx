import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentService } from "@/services/commentService";
import toast from "react-hot-toast";

interface CommentComposerProps {
  contentType: "post" | "story" | "poll";
  contentId: string;
  onCreated?: () => void;
}

export function CommentComposer({
  contentType,
  contentId,
  onCreated,
}: CommentComposerProps) {
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
      onCreated?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to post comment";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="min-h-[80px]"
        maxLength={2000}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={pending || !text.trim()}>
          {pending ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
}
