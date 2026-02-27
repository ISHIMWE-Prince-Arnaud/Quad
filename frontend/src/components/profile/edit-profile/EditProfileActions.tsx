import { PiSpinnerBold } from "react-icons/pi";

export function EditProfileActions({
  isSubmitting,
  profileProcessing,
  coverProcessing,
  onCancel,
}: {
  isSubmitting: boolean;
  profileProcessing: boolean;
  coverProcessing: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mt-10 pt-6 border-t border-border/40">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="w-full sm:w-auto sm:min-w-[160px] h-11 px-6 rounded-xl text-sm font-bold text-muted-foreground border border-border bg-muted hover:bg-accent hover:text-accent-foreground transition-all active:scale-[0.99]">
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting || profileProcessing || coverProcessing}
        className="w-full sm:w-auto sm:min-w-[180px] h-11 flex items-center justify-center gap-2 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
        {isSubmitting ? (
          <>
            <PiSpinnerBold className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}
