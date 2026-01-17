import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";

import type { Comment } from "@/types/comment";

export function CommentReplies({
  replies,
  repliesHasMore,
  repliesLoading,
  onLoadMore,
  ReplyItem,
  onReplyDeleted,
}: {
  replies: Comment[];
  repliesHasMore: boolean;
  repliesLoading: boolean;
  onLoadMore: () => void;
  ReplyItem: ComponentType<{
    comment: Comment;
    onDeleted?: (id: string) => void;
  }>;
  onReplyDeleted: (id: string) => void;
}) {
  return (
    <div className="ml-5 border-l-2 border-border/30 pl-6 space-y-6 mt-4">
      {replies.map((reply) => (
        <ReplyItem key={reply._id} comment={reply} onDeleted={onReplyDeleted} />
      ))}
      {repliesHasMore && (
        <div className="flex justify-start pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 text-xs"
            disabled={repliesLoading}
            onClick={onLoadMore}>
            {repliesLoading ? "Loading..." : "View more replies"}
          </Button>
        </div>
      )}
    </div>
  );
}
