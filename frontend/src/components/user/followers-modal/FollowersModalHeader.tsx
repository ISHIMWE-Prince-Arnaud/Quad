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
    <div className="flex items-center justify-between px-5 py-4 border-b bg-background/80 backdrop-blur">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-9 w-9 p-0 rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
