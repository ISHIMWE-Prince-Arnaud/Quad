import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import {
  PiClockBold,
  PiSpinnerBold,
  PiFloppyDiskBold,
  PiPaperPlaneRightBold,
} from "react-icons/pi";

import { Button } from "@/components/ui/button";
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
  submitting,
  autoSaving,
  lastSaved,
  editor,
  onTitleChange,
  onUploadCover,
  onRemoveCover,
  onSaveDraft,
  onPublish,
  onInsertLink,
  onMention,
  headerTitle,
}: {
  title: string;
  coverImage: string | undefined;
  uploadingCover: boolean;
  validationErrors: { title?: string; content?: string };
  canSubmit: boolean;
  submitting: boolean;
  autoSaving: boolean;
  lastSaved: Date | null;
  editor: Editor | null;
  onTitleChange: (value: string) => void;
  onUploadCover: (file: File | null) => void;
  onRemoveCover: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onInsertLink: () => void;
  onMention: () => void;
  headerTitle?: string;
}) {
  const autosaveLabel = getAutosaveLabel(autoSaving, lastSaved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground tracking-tight">
          {headerTitle || "Create a New Story"}
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={submitting}
            onClick={onSaveDraft}
            className="h-8 rounded-full border border-border/40 bg-muted hover:bg-accent text-foreground font-semibold px-4">
            {submitting ? (
              <PiSpinnerBold className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <PiFloppyDiskBold className="h-4 w-4 mr-2" />
            )}
            Save as Draft
          </Button>
          <Button
            disabled={!canSubmit || submitting}
            onClick={onPublish}
            className="h-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5">
            {submitting ? (
              <PiSpinnerBold className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <PiPaperPlaneRightBold className="h-4 w-4 mr-2 fill-current" />
            )}
            Publish
          </Button>
        </div>
      </div>

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
