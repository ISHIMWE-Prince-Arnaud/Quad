import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FollowersModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
