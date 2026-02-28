import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { PiClockBold, PiSpinnerBold } from "react-icons/pi";

import { cn } from "@/lib/utils";
import { StoryCoverSection } from "./StoryCoverSection";
import { StoryEditorBubbleMenu } from "./StoryEditorBubbleMenu";
import { StoryEditorSlashMenu } from "./StoryEditorSlashMenu";
import { StoryEditorToolbar } from "./StoryEditorToolbar";

function getAutosaveLabel(autoSaving: boolean, lastSaved: Date | null) {
  if (autoSaving) return "Autosaving...";
  if (!lastSaved) return null;

  const diffMs = Date.now() - lastSaved.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes <= 0) return "Autosaved just now";
  if (diffMinutes < 60) return `Autosaved ${diffMinutes}m ago`;

  const hours = Math.floor(diffMinutes / 60);
  return `Autosaved ${hours}h ago`;
}

export function CreateStoryForm({
  title,
  coverImage,
  uploadingCover,
  validationErrors,
  canSubmit,
  autoSaving,
  lastSaved,
  editor,
  onTitleChange,
  onUploadCover,
  onRemoveCover,
  onInsertLink,
  onMention,
}: {
  title: string;
  coverImage: string | undefined;
  uploadingCover: boolean;
  validationErrors: { title?: string; content?: string };
  canSubmit: boolean;
  autoSaving: boolean;
  lastSaved: Date | null;
  editor: Editor | null;
  onTitleChange: (value: string) => void;
  onUploadCover: (file: File | null) => void;
  onRemoveCover: () => void;
  onInsertLink: () => void;
  onMention: () => void;
}) {
  const autosaveLabel = getAutosaveLabel(autoSaving, lastSaved);

  return (
    <div className="space-y-6">
      {!canSubmit && (
        <p className="text-[11px] font-semibold text-muted-foreground">
          Add a title and some content to enable publishing.
        </p>
      )}

      <StoryCoverSection
        coverImage={coverImage}
        uploadingCover={uploadingCover}
        onUploadCover={onUploadCover}
        onRemoveCover={onRemoveCover}
      />

      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Add your story title..."
          className={cn(
            "w-full bg-transparent border-none focus:ring-0 text-2xl sm:text-3xl font-extrabold text-foreground placeholder:text-muted-foreground/60 p-0",
            validationErrors.title && "text-destructive",
          )}
        />
        {validationErrors.title && (
          <p className="text-sm font-semibold text-destructive">
            {validationErrors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div
          className={cn(
            "relative rounded-[2rem] border border-border/40 bg-card shadow-md overflow-hidden focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-colors",
            validationErrors.content && "border-destructive/60",
          )}>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <StoryEditorToolbar editor={editor} />
          </div>

          <div className="p-4">
            <StoryEditorBubbleMenu
              editor={editor}
              onInsertLink={onInsertLink}
            />
            <StoryEditorSlashMenu
              editor={editor}
              onInsertLink={onInsertLink}
              onMention={onMention}
            />
            <EditorContent editor={editor} />
          </div>

          {autosaveLabel && (
            <div className="absolute bottom-4 right-6 text-[10px] font-semibold text-muted-foreground flex items-center gap-2 select-none">
              {autoSaving ? (
                <PiSpinnerBold className="h-3 w-3 animate-spin" />
              ) : (
                <PiClockBold className="h-3 w-3" />
              )}
              <span>{autosaveLabel}</span>
            </div>
          )}
        </div>

        {validationErrors.content && (
          <p className="text-sm text-destructive">{validationErrors.content}</p>
        )}
      </div>
    </div>
  );
}
