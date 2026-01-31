import { Loader2 } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mt-10 pt-6 border-t border-white/5">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="w-full sm:w-auto sm:min-w-[160px] h-11 px-6 rounded-xl text-sm font-bold text-[#64748b] border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-[0.99]">
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting || profileProcessing || coverProcessing}
        className="w-full sm:w-auto sm:min-w-[180px] h-11 flex items-center justify-center gap-2 px-6 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold shadow-lg shadow-[#2563eb]/20 transition-all active:scale-95">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}
