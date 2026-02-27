import { Button } from "@/components/ui/button";
import { PiSpinnerBold } from "react-icons/pi";
import { cn } from "@/lib/utils";

export function PollSubmitBar({
  canSubmit,
  submitting,
  onSubmit,
  label,
  submittingLabel,
}: {
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  label?: string;
  submittingLabel?: string;
}) {
  return (
    <div className="pt-4">
      <Button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={onSubmit}
        className={cn(
          "w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95",
          !canSubmit && "opacity-70",
        )}>
        {submitting ? (
          <>
            <PiSpinnerBold className="mr-2 h-4 w-4 animate-spin" />
            {submittingLabel || "Posting..."}
          </>
        ) : (
          label || "Post Poll"
        )}
      </Button>
    </div>
  );
}
