import { useEffect, useMemo, useState } from "react";
import { UploadService } from "@/services/uploadService";
import { StoryService } from "@/services/storyService";
import type { CreateStoryInput, StoryStatus } from "@/types/story";
import { createStorySchema } from "@/schemas/story.schema";
import { getErrorMessage } from "./create-story/getErrorMessage";
import { CreateStoryForm } from "./create-story/CreateStoryForm";
import { useStoryEditor } from "./create-story/useStoryEditor";
import toast from "react-hot-toast";
import { logError } from "@/lib/errorHandling";

export default function CreateStoryPage() {
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
          logError(err, { component: "CreateStoryPage", action: "autoSaveStory" });
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
      toast.success("Cover image set");
    } catch (err) {
      logError(err, { component: "CreateStoryPage", action: "uploadCoverImage" });
      toast.error(getErrorMessage(err));
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
      toast.error("Please fix validation errors");
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
        toast.error(res.message || "Failed to save story");
        return;
      }
      toast.success(status === "published" ? "Story published" : "Draft saved");

      // Clear form
      setTitle("");
      setCoverImage(undefined);
      editor?.commands.clearContent();
      setValidationErrors({});
      setLastSaved(null);
    } catch (err) {
      logError(err, { component: "CreateStoryPage", action: "submitStory" });
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <CreateStoryForm
          title={title}
          coverImage={coverImage}
          uploadingCover={uploadingCover}
          validationErrors={validationErrors}
          canSubmit={canSubmit}
          submitting={submitting}
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
          onSaveDraft={() => void handleSubmit("draft")}
          onPublish={() => void handleSubmit("published")}
          onInsertLink={handleInsertLink}
          onMention={() => {
            const username = window.prompt(
              "Enter username to mention (without @)"
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
