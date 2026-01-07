import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { Loader2, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StoryCoverSection } from "./StoryCoverSection";
import { StoryEditorToolbar } from "./StoryEditorToolbar";

export function CreateStoryForm({
  title,
  excerpt,
  coverImage,
  uploadingCover,
  validationErrors,
  canSubmit,
  submitting,
  autoSaving,
  lastSaved,
  editor,
  onTitleChange,
  onExcerptChange,
  onUploadCover,
  onRemoveCover,
  onInsertInlineImage,
  onSaveDraft,
  onPublish,
  onInsertLink,
  onMention,
}: {
  title: string;
  excerpt: string;
  coverImage: string | undefined;
  uploadingCover: boolean;
  validationErrors: { title?: string; excerpt?: string; content?: string };
  canSubmit: boolean;
  submitting: boolean;
  autoSaving: boolean;
  lastSaved: Date | null;
  editor: Editor | null;
  onTitleChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onUploadCover: (file: File | null) => void;
  onRemoveCover: () => void;
  onInsertInlineImage: (file: File | null) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onInsertLink: () => void;
  onMention: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Create Story</h1>
            {autoSaving && (
              <p className="text-xs text-muted-foreground mt-1">Auto-saving...</p>
            )}
            {!autoSaving && lastSaved && (
              <p className="text-xs text-muted-foreground mt-1">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={!canSubmit || submitting}
              onClick={onSaveDraft}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button disabled={!canSubmit || submitting} onClick={onPublish}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Story title"
            className={validationErrors.title ? "border-red-500" : ""}
          />
          {validationErrors.title && (
            <p className="text-sm text-red-500">{validationErrors.title}</p>
          )}
        </div>

        <div className="space-y-1">
          <Textarea
            value={excerpt}
            onChange={(e) => onExcerptChange(e.target.value)}
            placeholder="Brief excerpt or summary (optional)"
            className={validationErrors.excerpt ? "border-red-500" : ""}
            rows={3}
            maxLength={500}
          />
          {validationErrors.excerpt && (
            <p className="text-sm text-red-500">{validationErrors.excerpt}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {excerpt.length}/500 characters
          </p>
        </div>

        <div className="space-y-3">
          <StoryCoverSection
            coverImage={coverImage}
            uploadingCover={uploadingCover}
            onUploadCover={onUploadCover}
            onRemoveCover={onRemoveCover}
            onInsertInlineImage={onInsertInlineImage}
          />
        </div>

        <div className="space-y-2">
          <StoryEditorToolbar
            editor={editor}
            onInsertLink={onInsertLink}
            onMention={onMention}
          />

          <div
            className={`rounded-md border bg-background ${
              validationErrors.content ? "border-red-500" : ""
            }`}>
            <EditorContent editor={editor} />
          </div>
          {validationErrors.content && (
            <p className="text-sm text-red-500">{validationErrors.content}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
