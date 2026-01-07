import { CommentComposer } from "@/components/comments/CommentComposer";

export function CommentReplyComposer({
  contentType,
  contentId,
  parentId,
  placeholder,
  onCreated,
}: {
  contentType: "post" | "story" | "poll";
  contentId: string;
  parentId: string;
  placeholder: string;
  onCreated: () => void;
}) {
  return (
    <div className="mt-3 ml-3 border-l pl-4">
      <CommentComposer
        contentType={contentType}
        contentId={contentId}
        parentId={parentId}
        placeholder={placeholder}
        autoFocus
        onCreated={onCreated}
      />
    </div>
  );
}
