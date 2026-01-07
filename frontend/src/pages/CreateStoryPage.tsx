import { useEffect, useMemo, useState } from "react";
import { UploadService } from "@/services/uploadService";
import { StoryService } from "@/services/storyService";
import type { CreateStoryInput, Story, StoryStatus } from "@/types/story";
import { createStorySchema } from "@/schemas/story.schema";
import { getErrorMessage } from "./create-story/getErrorMessage";
import { CreateStoryForm } from "./create-story/CreateStoryForm";
import { MyStoriesSidebar } from "./create-story/MyStoriesSidebar";
import { useStoryEditor } from "./create-story/useStoryEditor";
import toast from "react-hot-toast";

export default function CreateStoryPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editorHtml, setEditorHtml] = useState<string>("");
  const [myDrafts, setMyDrafts] = useState<Story[]>([]);
  const [myPublished, setMyPublished] = useState<Story[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    excerpt?: string;
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
        if (!editor) return;
        try {
          setAutoSaving(true);
          const content = editor.getHTML();
          const payload: CreateStoryInput = {
            title: title.trim(),
            content,
            excerpt: excerpt.trim() || undefined,
            coverImage,
            status: "draft",
          };
          await StoryService.create(payload);
          setLastSaved(new Date());
        } catch (err) {
          console.error("Auto-save failed:", err);
        } finally {
          setAutoSaving(false);
        }
      })();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [canSubmit, submitting, autoSaving, title, excerpt, coverImage, editor]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingMine(true);
        const drafts = await StoryService.getMine({
          status: "draft",
          limit: 10,
          skip: 0,
        });
        const published = await StoryService.getMine({
          status: "published",
          limit: 10,
          skip: 0,
        });
        if (!cancelled) {
          setMyDrafts(Array.isArray(drafts.data) ? drafts.data : []);
          setMyPublished(Array.isArray(published.data) ? published.data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoadingMine(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleInsertInlineImage = async (file: File | null) => {
    if (!file || !editor) return;
    try {
      const res = await UploadService.uploadStoryMedia(file);
      editor.chain().focus().setImage({ src: res.url }).run();
      toast.success("Image inserted");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    }
  };

  const handleSubmit = async (status: StoryStatus) => {
    if (!canSubmit || submitting || !editor) return;

    // Clear previous validation errors
    setValidationErrors({});

    const content = editor.getHTML();

    // Validate using Zod schema
    const validation = createStorySchema.safeParse({
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      coverImage,
      status,
    });

    if (!validation.success) {
      const errors: { title?: string; excerpt?: string; content?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === "title") {
          errors.title = err.message;
        } else if (err.path[0] === "excerpt") {
          errors.excerpt = err.message;
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
        excerpt: excerpt.trim() || undefined,
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
      setExcerpt("");
      setCoverImage(undefined);
      editor.commands.clearContent();
      setValidationErrors({});
      setLastSaved(null);

      // Refresh story lists
      try {
        const drafts = await StoryService.getMine({
          status: "draft",
          limit: 10,
          skip: 0,
        });
        const published = await StoryService.getMine({
          status: "published",
          limit: 10,
          skip: 0,
        });
        setMyDrafts(Array.isArray(drafts.data) ? drafts.data : []);
        setMyPublished(Array.isArray(published.data) ? published.data : []);
      } catch (e) {
        // ignore refresh errors
        console.debug("refresh my stories failed", e);
      }
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <CreateStoryForm
            title={title}
            excerpt={excerpt}
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
            onExcerptChange={(value) => {
              setExcerpt(value);
              if (validationErrors.excerpt) {
                setValidationErrors((prev) => ({
                  ...prev,
                  excerpt: undefined,
                }));
              }
            }}
            onUploadCover={(file) => void handleUploadCover(file)}
            onRemoveCover={() => setCoverImage(undefined)}
            onInsertInlineImage={(file) => void handleInsertInlineImage(file)}
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
        <div className="md:col-span-1">
          <MyStoriesSidebar
            loadingMine={loadingMine}
            myDrafts={myDrafts}
            myPublished={myPublished}
          />
        </div>
      </div>
    </div>
  );
}
