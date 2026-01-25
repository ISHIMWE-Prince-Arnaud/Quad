import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="pt-4">
      <Button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={onSubmit}
        className={cn(
          "w-full h-12 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold shadow-lg shadow-[#2563eb]/20 transition-all active:scale-95",
          !canSubmit && "opacity-70"
        )}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Posting...
          </>
        ) : (
          "Post Poll"
        )}
      </Button>
    </div>
  );
}
