import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadService } from "@/services/uploadService";
import { PollService } from "@/services/pollService";
import type {
  CreatePollInput,
  Poll,
  PollMedia,
  ResultsVisibility,
} from "@/types/poll";
import { Image as ImageIcon, Loader2 } from "lucide-react";
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

interface LocalOption {
  id: string;
  text: string;
  media?: PollMedia;
}

export default function CreatePollPage() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [questionMedia, setQuestionMedia] = useState<PollMedia | undefined>(
    undefined
  );
  const [options, setOptions] = useState<LocalOption[]>([
    { id: "opt-1", text: "" },
    { id: "opt-2", text: "" },
  ]);
  const [settings, setSettings] = useState<{
    allowMultiple: boolean;
    showResults: ResultsVisibility;
  }>({ allowMultiple: false, showResults: "afterVote" });
  const [expiresAt, setExpiresAt] = useState<string | "">("");

  const [submitting, setSubmitting] = useState(false);
  const [uploadingQuestionMedia, setUploadingQuestionMedia] = useState(false);
  const [uploadingOptionId, setUploadingOptionId] = useState<string | null>(
    null
  );

  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [loadingMyPolls, setLoadingMyPolls] = useState(false);

  const canSubmit = useMemo(() => {
    const q = question.trim();
    const filledOptions = options
      .map((o) => o.text.trim())
      .filter((t) => t.length > 0);
    return (
      q.length >= 10 && filledOptions.length >= 2 && filledOptions.length <= 5
    );
  }, [question, options]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingMyPolls(true);
        const res = await PollService.getMine({ page: 1, limit: 10 });
        if (!cancelled && res.success) {
          setMyPolls(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoadingMyPolls(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddOption = () => {
    if (options.length >= 5) return;
    setOptions((prev) => [...prev, { id: `opt-${Date.now()}`, text: "" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleOptionChange = (id: string, value: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, text: value } : o))
    );
  };

  const mapFileToMedia = (file: File, url: string): PollMedia => {
    const type: PollMedia["type"] = file.type.startsWith("video/")
      ? "video"
      : "image";
    return { url, type };
  };

  const handleUploadQuestionMedia = async (file: File | null) => {
    if (!file) return;
    try {
      setUploadingQuestionMedia(true);
      const res = await UploadService.uploadPollMedia(file);
      setQuestionMedia(mapFileToMedia(file, res.url));
      toast.success("Question media attached");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingQuestionMedia(false);
    }
  };

  const handleUploadOptionMedia = async (id: string, file: File | null) => {
    if (!file) return;
    try {
      setUploadingOptionId(id);
      const res = await UploadService.uploadPollMedia(file);
      const media = mapFileToMedia(file, res.url);
      setOptions((prev) =>
        prev.map((o) => (o.id === id ? { ...o, media } : o))
      );
      toast.success("Option media attached");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingOptionId(null);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);
      const trimmedQuestion = question.trim();
      const finalOptions = options
        .map((o) => ({ ...o, text: o.text.trim() }))
        .filter((o) => o.text.length > 0)
        .slice(0, 5);

      const payload: CreatePollInput = {
        question: trimmedQuestion,
        questionMedia,
        options: finalOptions.map((o) => ({ text: o.text, media: o.media })),
        settings: {
          allowMultiple: settings.allowMultiple,
          showResults: settings.showResults,
        },
        expiresAt: expiresAt || undefined,
      };

      const res = await PollService.create(payload);
      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to create poll");
        return;
      }

      toast.success("Poll created");
      navigate(`/app/polls/${res.data.id}`);
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
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Poll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  placeholder="Ask something engaging..."
                />
                <p className="text-xs text-muted-foreground">
                  Between 10 and 500 characters.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Question media (optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) =>
                        void handleUploadQuestionMedia(
                          e.target.files?.[0] || null
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingQuestionMedia}>
                      {uploadingQuestionMedia ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="mr-2 h-4 w-4" />
                      )}
                      {questionMedia ? "Change media" : "Add media"}
                    </Button>
                  </label>
                  {questionMedia && (
                    <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {questionMedia.type === "video"
                        ? "Video attached"
                        : "Image attached"}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Options</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddOption}
                    disabled={options.length >= 5}>
                    Add option
                  </Button>
                </div>
                <div className="space-y-2">
                  {options.map((opt, index) => (
                    <div
                      key={opt.id}
                      className="flex flex-col gap-2 rounded-md border p-2 md:flex-row md:items-center">
                      <div className="flex-1 space-y-1">
                        <Input
                          value={opt.text}
                          onChange={(e) =>
                            handleOptionChange(opt.id, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) =>
                                void handleUploadOptionMedia(
                                  opt.id,
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={uploadingOptionId === opt.id}>
                              {uploadingOptionId === opt.id ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <ImageIcon className="mr-1 h-3 w-3" />
                              )}
                              {opt.media ? "Change media" : "Add media"}
                            </Button>
                          </label>
                          {opt.media && (
                            <span>
                              {opt.media.type === "video" ? "Video" : "Image"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end md:w-24">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(opt.id)}
                          disabled={options.length <= 2}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide between 2 and 5 unique options.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Settings</label>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border"
                        checked={settings.allowMultiple}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            allowMultiple: e.target.checked,
                          }))
                        }
                      />
                      <span>Allow multiple selections</span>
                    </label>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        When should results be visible?
                      </span>
                      <select
                        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                        value={settings.showResults}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            showResults: e.target.value as ResultsVisibility,
                          }))
                        }>
                        <option value="always">Always</option>
                        <option value="afterVote">After user votes</option>
                        <option value="afterExpiry">After poll expires</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Expiry (optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no automatic expiry.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={!canSubmit || submitting}
                  onClick={() => void handleSubmit()}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create poll"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">My Recent Polls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {loadingMyPolls && (
                <div className="text-xs text-muted-foreground">
                  Loading polls...
                </div>
              )}
              {!loadingMyPolls && myPolls.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  You have not created any polls yet.
                </div>
              )}
              {!loadingMyPolls &&
                myPolls.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => navigate(`/app/polls/${p.id}`)}
                    className="block w-full truncate text-left hover:underline">
                    {p.question}
                  </button>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
