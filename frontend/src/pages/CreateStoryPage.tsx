import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UploadService } from "@/services/uploadService";
import { StoryService } from "@/services/storyService";
import type { CreateStoryInput, Story, StoryStatus } from "@/types/story";
import {
  Loader2,
  Image as ImageIcon,
  Type,
  Quote,
  List,
  ListOrdered,
  Bold,
  Italic,
  Link as LinkIcon,
  Save,
  Send,
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
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myDrafts, setMyDrafts] = useState<Story[]>([]);
  const [myPublished, setMyPublished] = useState<Story[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0,
    [title, content]
  );

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

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setContent(editorRef.current?.innerHTML || "");
  };

  const handleInsertLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    exec("createLink", url);
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
    if (!file) return;
    try {
      const res = await UploadService.uploadStoryMedia(file);
      editorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${res.url}" alt="image" />`
      );
      setContent(editorRef.current?.innerHTML || "");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    }
  };

  const handleSubmit = async (status: StoryStatus) => {
    if (!canSubmit || submitting) return;
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
      setTitle("");
      setContent("");
      setCoverImage(undefined);
      if (editorRef.current) editorRef.current.innerHTML = "";
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

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Story title"
              />

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
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={coverImage}
                    alt="cover"
                    className="w-full max-h-80 object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 border rounded-md p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => exec("formatBlock", "H2")}>
                  {" "}
                  <Type className="h-4 w-4 mr-1" /> H2
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => exec("formatBlock", "H3")}>
                  {" "}
                  <Type className="h-4 w-4 mr-1" /> H3
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => exec("formatBlock", "BLOCKQUOTE")}>
                  <Quote className="h-4 w-4 mr-1" /> Quote
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => exec("insertUnorderedList")}>
                  <List className="h-4 w-4 mr-1" /> Bullets
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => exec("insertOrderedList")}>
                  <ListOrdered className="h-4 w-4 mr-1" /> Numbers
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => exec("bold")}>
                  <Bold className="h-4 w-4 mr-1" /> Bold
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => exec("italic")}>
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
                ref={editorRef}
                className="min-h-[240px] rounded-md border bg-background p-3 focus:outline-none prose prose-invert max-w-none"
                contentEditable
                onInput={() => setContent(editorRef.current?.innerHTML || "")}
                suppressContentEditableWarning
              />
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
