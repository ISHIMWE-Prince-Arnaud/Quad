import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting || profileProcessing || coverProcessing}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
