import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function PollSubmitBar({
  canSubmit,
  submitting,
  onSubmit,
}: {
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <p className="text-sm text-muted-foreground">
        {canSubmit
          ? "Ready to publish your poll"
          : "Fill in all required fields to continue"}
      </p>
      <Button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={onSubmit}
        size="lg"
        className="min-w-[140px]">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Poll"
        )}
      </Button>
    </div>
  );
}
