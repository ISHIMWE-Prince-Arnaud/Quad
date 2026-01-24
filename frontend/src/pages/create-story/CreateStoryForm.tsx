import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { Loader2, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
  onSaveDraft: () => void;
  onPublish: () => void;
  onInsertLink: () => void;
  onMention: () => void;
}) {
  return (
    <Card className="bg-[#0f121a] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
      <CardContent className="p-8 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Create Story
            </h1>
            {autoSaving && (
              <p className="text-[11px] font-bold text-[#64748b] mt-1 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Auto-saving...
              </p>
            )}
            {!autoSaving && lastSaved && (
              <p className="text-[11px] font-bold text-[#64748b] mt-1">
                Saved at{" "}
                {lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              disabled={!canSubmit || submitting}
              onClick={onSaveDraft}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold px-6">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Draft
            </Button>
            <Button
              disabled={!canSubmit || submitting}
              onClick={onPublish}
              className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-8 shadow-lg shadow-[#2563eb]/20">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2 fill-current" />
              )}
              Publish
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Add your story title"
            className={cn(
              "w-full bg-transparent border-none focus:ring-0 text-4xl font-black text-white placeholder-white/10 p-0",
              validationErrors.title && "text-destructive"
            )}
          />
          {validationErrors.title && (
            <p className="text-sm font-bold text-destructive">
              {validationErrors.title}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <StoryCoverSection
            coverImage={coverImage}
            uploadingCover={uploadingCover}
            onUploadCover={onUploadCover}
            onRemoveCover={onRemoveCover}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
              Description
            </h3>
            <textarea
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              placeholder="Add your story description..."
              className={cn(
                "w-full bg-white/5 border border-white/5 focus:border-[#2563eb]/50 focus:ring-0 rounded-2xl text-[#f1f5f9] placeholder-[#64748b] p-4 min-h-[120px] resize-none transition-all",
                validationErrors.excerpt && "border-destructive/50"
              )}
              maxLength={500}
            />
            <div className="flex justify-between items-center text-[10px] font-bold text-[#64748b]">
              <span>{excerpt.length}/500 characters</span>
              {validationErrors.excerpt && (
                <span className="text-destructive uppercase">
                  {validationErrors.excerpt}
                </span>
              )}
            </div>
          </div>
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
