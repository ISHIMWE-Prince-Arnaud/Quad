import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function StoryDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete story?"
      description="This action cannot be undone. This will permanently delete your story and all its comments."
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}
