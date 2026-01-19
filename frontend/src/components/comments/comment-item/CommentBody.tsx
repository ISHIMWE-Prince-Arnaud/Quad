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
      <div className="mt-2 space-y-3">
        <Textarea
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          className="min-h-[56px] rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#64748b] focus-visible:ring-1 focus-visible:ring-blue-500/60"
          maxLength={2000}
        />
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-[#94a3b8] hover:text-white hover:bg-transparent"
            disabled={editPending}
            onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
            disabled={editPending}
            loading={editPending}
            onClick={onSave}>
            Save changes
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
