import type { Editor } from "@tiptap/core";
import { Redo2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StoryEditorToolbar({ editor }: { editor: Editor | null }) {
  return (
    <div className="flex items-center gap-1 bg-card/70 border border-border/40 rounded-full px-2 py-1 shadow-lg shadow-black/20">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!editor?.can().undo()}
        onClick={() => editor?.chain().focus().undo().run()}
        className={cn(
          "h-8 w-8 p-0 rounded-full transition-all",
          editor?.can().undo()
            ? "text-muted-foreground hover:text-foreground hover:bg-accent"
            : "text-muted-foreground/40",
        )}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!editor?.can().redo()}
        onClick={() => editor?.chain().focus().redo().run()}
        className={cn(
          "h-8 w-8 p-0 rounded-full transition-all",
          editor?.can().redo()
            ? "text-muted-foreground hover:text-foreground hover:bg-accent"
            : "text-muted-foreground/40",
        )}>
        <Redo2 className="h-4 w-4" />
      </Button>
      <div className="w-[1px] h-6 bg-border/40 mx-1 self-center" />
      <span className="hidden sm:block text-[11px] font-semibold text-muted-foreground pr-2 select-none">
        Type / for commands
      </span>
    </div>
  );
}
