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
  ReplyItem: ComponentType<{ comment: Comment; onDeleted?: (id: string) => void }>;
  onReplyDeleted: (id: string) => void;
}) {
  return (
    <div className="mt-3 ml-3 border-l pl-4 space-y-2">
      {replies.map((reply) => (
        <ReplyItem key={reply._id} comment={reply} onDeleted={onReplyDeleted} />
      ))}
      {repliesHasMore && (
        <div className="flex justify-start pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={repliesLoading}
            onClick={onLoadMore}>
            {repliesLoading ? "Loading..." : "Load more replies"}
          </Button>
        </div>
      )}
    </div>
  );
}
