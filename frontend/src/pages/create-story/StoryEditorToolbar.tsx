import type { Editor } from "@tiptap/core";
import {
  AtSign,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StoryEditorToolbar({
  editor,
  onInsertLink,
  onMention,
}: {
  editor: Editor | null;
  onInsertLink: () => void;
  onMention: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 bg-white/[0.02] border border-white/5 rounded-2xl p-2 mb-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={cn(
          "h-10 px-3 rounded-xl transition-all",
          editor?.isActive("heading", { level: 2 })
            ? "bg-[#2563eb] text-white"
            : "text-[#64748b] hover:text-white hover:bg-white/5"
        )}>
        <Heading2 className="h-4 w-4 mr-2" /> H2
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={cn(
          "h-10 px-3 rounded-xl transition-all",
          editor?.isActive("heading", { level: 3 })
            ? "bg-[#2563eb] text-white"
            : "text-[#64748b] hover:text-white hover:bg-white/5"
        )}>
        <Heading3 className="h-4 w-4 mr-2" /> H3
      </Button>
      <div className="w-[1px] h-6 bg-white/5 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={cn(
          "h-10 w-10 p-0 rounded-xl transition-all",
          editor?.isActive("bold")
            ? "bg-[#2563eb] text-white"
            : "text-[#64748b] hover:text-white hover:bg-white/5"
        )}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={cn(
          "h-10 w-10 p-0 rounded-xl transition-all",
          editor?.isActive("italic")
            ? "bg-[#2563eb] text-white"
            : "text-[#64748b] hover:text-white hover:bg-white/5"
        )}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={cn(
          "h-10 w-10 p-0 rounded-xl transition-all",
          editor?.isActive("underline")
            ? "bg-[#2563eb] text-white"
            : "text-[#64748b] hover:text-white hover:bg-white/5"
        )}>
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <div className="w-[1px] h-6 bg-white/5 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-10 w-10 p-0 rounded-xl transition-all",
          editor?.isActive("bulletList")
            ? "bg-[#2563eb] text-white"
            : "text-[#64748b] hover:text-white hover:bg-white/5"
        )}>
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={cn(
          "h-10 w-10 p-0 rounded-xl transition-all",
          editor?.isActive("orderedList")
            ? "bg-[#2563eb] text-white"
            : "text-[#64748b] hover:text-white hover:bg-white/5"
        )}>
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-[1px] h-6 bg-white/5 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        className={cn(
          "h-10 w-10 p-0 rounded-xl transition-all",
          editor?.isActive("blockquote")
            ? "bg-[#2563eb] text-white"
            : "text-[#64748b] hover:text-white hover:bg-white/5"
        )}>
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onInsertLink}
        className="h-10 w-10 p-0 rounded-xl text-[#64748b] hover:text-white hover:bg-white/5 transition-all">
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onMention}
        className="h-10 w-10 p-0 rounded-xl text-[#64748b] hover:text-white hover:bg-white/5 transition-all"
        title="Mention user">
        <AtSign className="h-4 w-4" />
      </Button>
    </div>
  );
}
