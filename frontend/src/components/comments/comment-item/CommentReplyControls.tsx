export function CommentReplyControls({
  repliesCount,
  repliesOpen,
  onToggleRepliesOpen,
  onToggleComposer,
}: {
  repliesCount: number;
  repliesOpen: boolean;
  onToggleRepliesOpen: () => void;
  onToggleComposer: () => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
      <button type="button" className="hover:underline" onClick={onToggleComposer}>
        Reply
      </button>
      {repliesCount > 0 && (
        <button
          type="button"
          className="hover:underline"
          onClick={onToggleRepliesOpen}>
          {repliesOpen ? "Hide replies" : `View replies (${repliesCount})`}
        </button>
      )}
    </div>
  );
}
