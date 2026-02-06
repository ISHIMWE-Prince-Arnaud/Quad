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
          className="min-h-[56px] rounded-xl border-border/60 bg-muted/50 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/30"
          maxLength={2000}
        />
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 px-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
            disabled={editPending}
            onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 px-6 rounded-full bg-primary text-primary-foreground hover:opacity-90"
            disabled={editPending}
            loading={editPending}
            onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className="mt-1 text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
      <MentionText text={bodyText} />
    </p>
  );
}
