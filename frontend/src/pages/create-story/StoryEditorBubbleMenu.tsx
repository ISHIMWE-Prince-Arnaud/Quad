import type { Editor } from "@tiptap/core";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StoryEditorBubbleMenu({
  editor,
  onInsertLink,
}: {
  editor: Editor | null;
  onInsertLink: () => void;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { selection } = editor.state;
      if (selection.empty || !editor.view.hasFocus()) {
        setCoords(null);
        return;
      }

      const from = selection.from;
      const to = selection.to;
      const a = editor.view.coordsAtPos(from);
      const b = editor.view.coordsAtPos(to);
      const left = (a.left + b.right) / 2;
      const top = Math.min(a.top, b.top) - 10;
      setCoords({ top, left });
    };

    update();
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    const onWindowUpdate = () => update();
    window.addEventListener("scroll", onWindowUpdate, true);
    window.addEventListener("resize", onWindowUpdate);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      window.removeEventListener("scroll", onWindowUpdate, true);
      window.removeEventListener("resize", onWindowUpdate);
    };
  }, [editor]);

  if (!editor || !coords) return null;

  return (
    <div
      className="fixed z-50"
      style={{ top: coords.top, left: coords.left, transform: "translate(-50%, -100%)" }}>
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0f121a]/90 px-2 py-1 shadow-lg shadow-black/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0 rounded-full transition-all",
            editor.isActive("bold")
              ? "bg-[#2563eb] text-white"
              : "text-[#64748b] hover:text-white hover:bg-white/5"
          )}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0 rounded-full transition-all",
            editor.isActive("italic")
              ? "bg-[#2563eb] text-white"
              : "text-[#64748b] hover:text-white hover:bg-white/5"
          )}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "h-8 w-8 p-0 rounded-full transition-all",
            editor.isActive("underline")
              ? "bg-[#2563eb] text-white"
              : "text-[#64748b] hover:text-white hover:bg-white/5"
          )}>
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(
            "h-8 w-8 p-0 rounded-full transition-all",
            editor.isActive("code")
              ? "bg-[#2563eb] text-white"
              : "text-[#64748b] hover:text-white hover:bg-white/5"
          )}>
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-[1px] h-6 bg-white/5 mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsertLink}
          className={cn(
            "h-8 w-8 p-0 rounded-full transition-all",
            editor.isActive("link")
              ? "bg-[#2563eb] text-white"
              : "text-[#64748b] hover:text-white hover:bg-white/5"
          )}>
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="w-[1px] h-6 bg-white/5 mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={cn(
            "h-8 w-8 p-0 rounded-full transition-all",
            editor.isActive({ textAlign: "left" })
              ? "bg-[#2563eb] text-white"
              : "text-[#64748b] hover:text-white hover:bg-white/5"
          )}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={cn(
            "h-8 w-8 p-0 rounded-full transition-all",
            editor.isActive({ textAlign: "center" })
              ? "bg-[#2563eb] text-white"
              : "text-[#64748b] hover:text-white hover:bg-white/5"
          )}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={cn(
            "h-8 w-8 p-0 rounded-full transition-all",
            editor.isActive({ textAlign: "right" })
              ? "bg-[#2563eb] text-white"
              : "text-[#64748b] hover:text-white hover:bg-white/5"
          )}>
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
