import { useEffect, useMemo, useState } from "react";
import {
  PiArrowLeftBold,
  PiSpinnerBold,
  PiFloppyDiskBold,
  PiPaperPlaneRightBold,
} from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { UploadService } from "@/services/uploadService";
import { StoryService } from "@/services/storyService";
import type { CreateStoryInput, StoryStatus } from "@/types/story";
import { createStorySchema } from "@/schemas/story.schema";
import { getErrorMessage } from "./create-story/getErrorMessage";
import { CreateStoryForm } from "./create-story/CreateStoryForm";
import { useStoryEditor } from "./create-story/useStoryEditor";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";
import { logError } from "@/lib/errorHandling";
import { Button } from "@/components/ui/button";

export default function CreateStoryPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editorHtml, setEditorHtml] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
  }>({});
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useStoryEditor();

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      setEditorHtml(editor.getHTML());
    };

    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  const canSubmit = useMemo(() => {
    const textContent = editorHtml.replace(/<[^>]*>/g, "").trim();
    return title.trim().length > 0 && textContent.length > 0;
  }, [title, editorHtml]);

  useEffect(() => {
    if (!canSubmit || submitting || autoSaving) return;

    const autoSaveInterval = setInterval(() => {
      void (async () => {
        try {
          setAutoSaving(true);
          const content = editor?.getHTML() || "";
          const payload: CreateStoryInput = {
            title: title.trim(),
            content,
            coverImage,
            status: "draft",
          };
          await StoryService.create(payload);
          setLastSaved(new Date());
        } catch (err) {
          logError(err, {
            component: "CreateStoryPage",
            action: "autoSaveStory",
          });
        } finally {
          setAutoSaving(false);
        }
      })();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [canSubmit, submitting, autoSaving, title, coverImage, editor]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const handleInsertLink = () => {
    if (!editor) return;
    const url = window.prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  const handleUploadCover = async (file: File | null) => {
    if (!file) return;
    try {
      setUploadingCover(true);
      const res = await UploadService.uploadStoryMedia(file);
      setCoverImage(res.url);
      showSuccessToast("Cover image set");
    } catch (err) {
      logError(err, {
        component: "CreateStoryPage",
        action: "uploadCoverImage",
      });
      showErrorToast(getErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (status: StoryStatus) => {
    if (!canSubmit || submitting) return;

    // Clear previous validation errors
    setValidationErrors({});

    const content = editor?.getHTML() || "";

    // Validate using Zod schema
    const validation = createStorySchema.safeParse({
      title: title.trim(),
      content,
      coverImage,
      status,
    });

    if (!validation.success) {
      const errors: { title?: string; content?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === "title") {
          errors.title = err.message;
        } else if (err.path[0] === "content") {
          errors.content = err.message;
        }
      });
      setValidationErrors(errors);
      showErrorToast("Fix validation errors");
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateStoryInput = {
        title: title.trim(),
        content,
        coverImage,
        status,
      };
      const res = await StoryService.create(payload);
      if (!res.success) {
        showErrorToast(res.message || "Failed to save story");
        return;
      }
      showSuccessToast(
        status === "published" ? "Story published" : "Draft saved",
      );

      // Clear form
      setTitle("");
      setCoverImage(undefined);
      editor?.commands.clearContent();
      setValidationErrors({});
      setLastSaved(null);
    } catch (err) {
      logError(err, { component: "CreateStoryPage", action: "submitStory" });
      showErrorToast(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            className="group inline-flex items-center gap-3 text-muted-foreground hover:text-foreground font-bold transition-all"
            onClick={() => navigate("/app/stories")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary group-hover:bg-accent transition-colors">
              <PiArrowLeftBold className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </div>
            <span className="text-xl tracking-tight hidden sm:block">
              Create Story
            </span>
          </button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              disabled={submitting}
              onClick={() => void handleSubmit("draft")}
              className="h-9 rounded-full border border-border/40 bg-muted hover:bg-accent text-foreground font-semibold px-4">
              {submitting ? (
                <PiSpinnerBold className="h-4 w-4 animate-spin sm:mr-2" />
              ) : (
                <PiFloppyDiskBold className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Save as Draft</span>
            </Button>
            <Button
              disabled={!canSubmit || submitting}
              onClick={() => void handleSubmit("published")}
              className="h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5">
              {submitting ? (
                <PiSpinnerBold className="h-4 w-4 animate-spin sm:mr-2" />
              ) : (
                <PiPaperPlaneRightBold className="h-4 w-4 sm:mr-2 fill-current" />
              )}
              <span className="hidden sm:inline">Publish</span>
            </Button>
          </div>
        </div>

        <CreateStoryForm
          title={title}
          coverImage={coverImage}
          uploadingCover={uploadingCover}
          validationErrors={validationErrors}
          canSubmit={canSubmit}
          autoSaving={autoSaving}
          lastSaved={lastSaved}
          editor={editor}
          onTitleChange={(value) => {
            setTitle(value);
            if (validationErrors.title) {
              setValidationErrors((prev) => ({
                ...prev,
                title: undefined,
              }));
            }
          }}
          onUploadCover={(file) => void handleUploadCover(file)}
          onRemoveCover={() => setCoverImage(undefined)}
          onInsertLink={handleInsertLink}
          onMention={() => {
            const username = window.prompt(
              "Enter username to mention (without @)",
            );
            if (username) {
              editor?.chain().focus().insertContent(`@${username} `).run();
            }
          }}
        />
      </div>
    </div>
  );
}
