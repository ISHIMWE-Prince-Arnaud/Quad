import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UploadService } from "@/services/uploadService";
import { StoryService } from "@/services/storyService";
import type { CreateStoryInput, Story, StoryStatus } from "@/types/story";
import { createStorySchema } from "@/schemas/story.schema";
import {
  Loader2,
  Image as ImageIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Bold,
  Italic,
  Link as LinkIcon,
  Save,
  Send,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const apiMessage = response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

export default function CreateStoryPage() {
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myDrafts, setMyDrafts] = useState<Story[]>([]);
  const [myPublished, setMyPublished] = useState<Story[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Placeholder.configure({
        placeholder: "Write your story content here...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4",
      },
    },
  });

  const canSubmit = useMemo(() => {
    if (!editor) return false;
    const content = editor.getHTML();
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    return title.trim().length > 0 && textContent.length > 0;
  }, [title, editor?.getHTML()]);

  // Load user's stories
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

  // Cleanup editor on unmount
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
      editor.commands.clearContent();
      setValidationErrors({});

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
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Create Story</h1>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={!canSubmit || submitting}
                    onClick={() => void handleSubmit("draft")}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Draft
                  </Button>
                  <Button
                    disabled={!canSubmit || submitting}
                    onClick={() => void handleSubmit("published")}>
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
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationErrors.title) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        title: undefined,
                      }));
                    }
                  }}
                  placeholder="Story title"
                  className={validationErrors.title ? "border-red-500" : ""}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) =>
                      void handleUploadCover(e.target.files?.[0] || null)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingCover}>
                    {uploadingCover ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ImageIcon className="h-4 w-4 mr-2" />
                    )}
                    {coverImage ? "Change Cover" : "Add Cover"}
                  </Button>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) =>
                      void handleInsertInlineImage(e.target.files?.[0] || null)
                    }
                  />
                  <Button type="button" variant="outline">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Insert Inline Image
                  </Button>
                </label>
              </div>

              {coverImage && (
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={coverImage}
                    alt="cover"
                    className="w-full max-h-80 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setCoverImage(undefined)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 border rounded-md p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={
                      editor?.isActive("heading", { level: 2 })
                        ? "bg-accent"
                        : ""
                    }>
                    <Heading2 className="h-4 w-4 mr-1" /> H2
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className={
                      editor?.isActive("heading", { level: 3 })
                        ? "bg-accent"
                        : ""
                    }>
                    <Heading3 className="h-4 w-4 mr-1" /> H3
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                    className={
                      editor?.isActive("blockquote") ? "bg-accent" : ""
                    }>
                    <Quote className="h-4 w-4 mr-1" /> Quote
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                    className={
                      editor?.isActive("bulletList") ? "bg-accent" : ""
                    }>
                    <List className="h-4 w-4 mr-1" /> Bullets
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                    className={
                      editor?.isActive("orderedList") ? "bg-accent" : ""
                    }>
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
                    onClick={handleInsertLink}>
                    <LinkIcon className="h-4 w-4 mr-1" /> Link
                  </Button>
                </div>

                <div
                  className={`rounded-md border bg-background ${
                    validationErrors.content ? "border-red-500" : ""
                  }`}>
                  <EditorContent editor={editor} />
                </div>
                {validationErrors.content && (
                  <p className="text-sm text-red-500">
                    {validationErrors.content}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              <h2 className="text-sm font-medium">My Stories</h2>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Drafts</div>
                {loadingMine && (
                  <div className="text-xs text-muted-foreground">
                    Loading...
                  </div>
                )}
                {!loadingMine && myDrafts.length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    No drafts yet
                  </div>
                )}
                {myDrafts.map((s) => (
                  <a
                    key={s._id}
                    href={`/app/stories/${s._id}`}
                    className="block truncate hover:underline">
                    {s.title}
                  </a>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Published</div>
                {!loadingMine && myPublished.length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    No published stories
                  </div>
                )}
                {myPublished.map((s) => (
                  <a
                    key={s._id}
                    href={`/app/stories/${s._id}`}
                    className="block truncate hover:underline">
                    {s.title}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
