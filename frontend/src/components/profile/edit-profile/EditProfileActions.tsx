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
    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-10 pt-6 border-t border-white/5">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-sm font-bold text-[#64748b] hover:text-white transition-all">
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting || profileProcessing || coverProcessing}
        className="w-full sm:min-w-[160px] h-11 flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold shadow-lg shadow-[#2563eb]/20 transition-all active:scale-95">
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
