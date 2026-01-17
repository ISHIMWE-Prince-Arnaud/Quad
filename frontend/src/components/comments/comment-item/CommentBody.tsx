import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MentionText } from "@/components/ui/mention-text";

export function CommentBody({
  isEditing,
  bodyText,
  editText,
  onEditTextChange,
  editPending,
  onCancel,
  onSave,
}: {
  isEditing: boolean;
  bodyText: string;
  editText: string;
  onEditTextChange: (value: string) => void;
  editPending: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (isEditing) {
    return (
      <div className="mt-1 space-y-2">
        <Textarea
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          className="min-h-[60px]"
          maxLength={2000}
        />
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={editPending}
            onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={editPending}
            onClick={onSave}>
            {editPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className="mt-1 text-[13px] leading-relaxed text-[#94a3b8] whitespace-pre-wrap break-words">
      <MentionText text={bodyText} />
    </p>
  );
}
