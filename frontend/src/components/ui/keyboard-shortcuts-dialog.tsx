import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  key: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: "N", description: "Create new post" },
  { key: "H", description: "Go to home/feed" },
  { key: "P", description: "Go to your profile" },
  { key: "B", description: "Go to notifications (Bell)" },
  { key: "/", description: "Show this help dialog" },
  { key: "Esc", description: "Close dialogs/modals" },
  { key: "Tab", description: "Navigate between elements" },
  { key: "Enter", description: "Activate focused element" },
  { key: "Space", description: "Activate buttons/checkboxes" },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleShowShortcuts = () => setOpen(true);
    window.addEventListener("show-keyboard-shortcuts", handleShowShortcuts);
    return () =>
      window.removeEventListener(
        "show-keyboard-shortcuts",
        handleShowShortcuts
      );
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate the application quickly
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Note: Shortcuts don't work when typing in text fields
        </p>
      </DialogContent>
    </Dialog>
  );
}
