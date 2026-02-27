import { Button } from "@/components/ui/button";
import { PiXBold } from "react-icons/pi";

export function EditProfileModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your profile information and images.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0">
        <PiXBold className="h-4 w-4" />
      </Button>
    </div>
  );
}
