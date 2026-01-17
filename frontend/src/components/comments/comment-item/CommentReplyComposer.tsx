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
  void contentType;
  void contentId;
  void parentId;
  void placeholder;
  void onCreated;
  return null;
}
