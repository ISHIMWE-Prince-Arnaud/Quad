import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PiWarningBold, PiTrashBold } from "react-icons/pi";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  loading = false,
  className,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className={cn(
          "max-w-md rounded-3xl border border-border bg-popover p-8 text-popover-foreground shadow-dropdown",
          className,
        )}>
        <DialogHeader className="items-center text-center space-y-4">
          <div
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center",
              variant === "destructive" ? "bg-destructive/15" : "bg-primary/15",
            )}>
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                variant === "destructive" ? "bg-destructive" : "bg-primary",
              )}>
              {variant === "destructive" ? (
                <PiTrashBold
                  className="h-5 w-5 text-destructive-foreground"
                  aria-hidden="true"
                />
              ) : (
                <PiWarningBold
                  className="h-5 w-5 text-primary-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
          <DialogTitle className="text-[28px] font-bold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-[14px] leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex flex-row items-center justify-center gap-4 sm:justify-center sm:space-x-0">
          <Button
            type="button"
            variant="secondary"
            className="h-12 rounded-full px-10 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            disabled={loading}
            onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            className="h-12 rounded-full px-10"
            loading={loading}
            disabled={loading}
            onClick={() => void handleConfirm()}>
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
