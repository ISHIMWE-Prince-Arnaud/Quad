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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            canSubmit ? "bg-green-500" : "bg-yellow-500"
          )}
        />
        <p className="text-[13px] font-bold text-[#64748b] uppercase tracking-wider">
          {canSubmit
            ? "Ready to publish your poll"
            : "Required: Question & 2+ Options"}
        </p>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={onSubmit}
          className="w-full sm:min-w-[180px] h-12 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold shadow-lg shadow-[#2563eb]/20 transition-all active:scale-95">
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
    </div>
  );
}
