import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { UploadService } from "@/services/uploadService";
import { StoryService } from "@/services/storyService";
import type { Story, StoryStatus, UpdateStoryInput } from "@/types/story";
import { createStorySchema } from "@/schemas/story.schema";
import { logError } from "@/lib/errorHandling";

import { CreateStoryForm } from "./create-story/CreateStoryForm";
import { useStoryEditor } from "./create-story/useStoryEditor";
import { getErrorMessage } from "./create-story/getErrorMessage";

export default function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [initialCoverImage, setInitialCoverImage] = useState<
    string | undefined
  >(undefined);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editorHtml, setEditorHtml] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  const editor = useStoryEditor();

  useEffect(() => {
    if (!id) {
      setError("Story ID is required");
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await StoryService.getById(id);
        if (!cancelled && res.success && res.data) {
          setStory(res.data);
          setTitle(res.data.title);
          setCoverImage(res.data.coverImage);
          setInitialCoverImage(res.data.coverImage);

          if (editor) {
            editor.commands.setContent(res.data.content || "");
          }
        } else if (!cancelled) {
          setError(res.message || "Failed to load story");
        }
      } catch (err) {
        logError(err, {
          component: "EditStoryPage",
          action: "loadStory",
          metadata: { id },
        });
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, editor]);

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

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const canSubmit = useMemo(() => {
    const textContent = editorHtml.replace(/<[^>]*>/g, "").trim();
    return title.trim().length > 0 && textContent.length > 0;
  }, [title, editorHtml]);

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
      logError(err, {
        component: "EditStoryPage",
        action: "uploadCoverImage",
        metadata: { id },
      });
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (status: StoryStatus) => {
    if (!id || !story || !canSubmit || submitting) return;

    setValidationErrors({});

    const content = editor?.getHTML() || "";
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

      const payload: UpdateStoryInput = {
        title: title.trim(),
        content,
        status,
      };

      if (coverImage) {
        payload.coverImage = coverImage;
      } else if (initialCoverImage) {
        payload.coverImage = null;
      }

      const res = await StoryService.update(id, payload);
      if (!res.success) {
        toast.error(res.message || "Failed to update story");
        return;
      }

      toast.success(status === "published" ? "Story updated" : "Draft updated");
      navigate(`/app/stories/${id}`, {
        state: { story: res.data, refreshKey: Date.now() },
      });
    } catch (err) {
      logError(err, {
        component: "EditStoryPage",
        action: "updateStory",
        metadata: { id },
      });
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !story) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Unable to edit story</h2>
          <p className="text-muted-foreground mb-4">
            {error ||
              "The story you are trying to edit does not exist or cannot be loaded."}
          </p>
          <Button onClick={() => navigate("/app/stories")}>
            Back to Stories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <CreateStoryForm
          headerTitle="Edit Story"
          title={title}
          coverImage={coverImage}
          uploadingCover={uploadingCover}
          validationErrors={validationErrors}
          canSubmit={canSubmit}
          submitting={submitting}
          autoSaving={false}
          lastSaved={null}
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
