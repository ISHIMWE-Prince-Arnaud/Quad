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
    <div className="flex flex-wrap gap-2 border rounded-md p-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor?.isActive("heading", { level: 2 }) ? "bg-accent" : ""}>
        <Heading2 className="h-4 w-4 mr-1" /> H2
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor?.isActive("heading", { level: 3 }) ? "bg-accent" : ""}>
        <Heading3 className="h-4 w-4 mr-1" /> H3
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        className={editor?.isActive("blockquote") ? "bg-accent" : ""}>
        <Quote className="h-4 w-4 mr-1" /> Quote
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={editor?.isActive("bulletList") ? "bg-accent" : ""}>
        <List className="h-4 w-4 mr-1" /> Bullets
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={editor?.isActive("orderedList") ? "bg-accent" : ""}>
        <ListOrdered className="h-4 w-4 mr-1" /> Numbers
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={editor?.isActive("bold") ? "bg-accent" : ""}>
        <Bold className="h-4 w-4 mr-1" /> Bold
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={editor?.isActive("italic") ? "bg-accent" : ""}>
        <Italic className="h-4 w-4 mr-1" /> Italic
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={editor?.isActive("underline") ? "bg-accent" : ""}>
        <UnderlineIcon className="h-4 w-4 mr-1" /> Underline
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onInsertLink}>
        <LinkIcon className="h-4 w-4 mr-1" /> Link
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onMention}
        title="Mention user">
        <AtSign className="h-4 w-4 mr-1" /> Mention
      </Button>
    </div>
  );
}
