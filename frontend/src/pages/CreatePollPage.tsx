import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadService } from "@/services/uploadService";
import { PollService } from "@/services/pollService";
import type {
  CreatePollInput,
  Poll,
  PollMedia,
  ResultsVisibility,
} from "@/types/poll";
import { createPollSchema } from "@/schemas/poll.schema";
import { Image as ImageIcon, Loader2, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { ZodError } from "zod";
import { cn } from "@/lib/utils";

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

interface ValidationErrors {
  question?: string;
  options?: string;
  expiresAt?: string;
  general?: string;
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [loadingMyPolls, setLoadingMyPolls] = useState(false);

  const canSubmit = useMemo(() => {
    const q = question.trim();
    const filledOptions = options
      .map((o) => o.text.trim())
      .filter((t) => t.length > 0);
    return (
      q.length >= 10 &&
      q.length <= 500 &&
      filledOptions.length >= 2 &&
      filledOptions.length <= 5
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

    // Clear previous validation errors
    setValidationErrors({});

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

      // Validate with Zod schema
      try {
        createPollSchema.parse(payload);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          const errors: ValidationErrors = {};
          validationError.issues.forEach((err: any) => {
            const path = err.path[0] as string;
            if (path === "question") {
              errors.question = err.message;
            } else if (path === "options") {
              errors.options = err.message;
            } else if (path === "expiresAt") {
              errors.expiresAt = err.message;
            } else {
              errors.general = err.message;
            }
          });
          setValidationErrors(errors);
          toast.error(
            errors.general || "Please fix validation errors before submitting"
          );
          return;
        }
        throw validationError;
      }

      const res = await PollService.create(payload);
      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to create poll");
        return;
      }

      toast.success("Poll created successfully!");
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
          <Card className="shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl">Create Poll</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ask a question and let your community vote
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Question Input */}
              <div className="space-y-2">
                <Label htmlFor="poll-question" className="text-sm font-medium">
                  Question *
                </Label>
                <Textarea
                  id="poll-question"
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    if (validationErrors.question) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        question: undefined,
                      }));
                    }
                  }}
                  rows={3}
                  maxLength={500}
                  placeholder="Ask something engaging..."
                  className={validationErrors.question ? "border-red-500" : ""}
                  aria-invalid={!!validationErrors.question}
                  aria-describedby={
                    validationErrors.question
                      ? "question-error"
                      : "question-help"
                  }
                />
                {validationErrors.question ? (
                  <p
                    id="question-error"
                    className="text-xs text-red-500"
                    role="alert">
                    {validationErrors.question}
                  </p>
                ) : (
                  <p
                    id="question-help"
                    className="text-xs text-muted-foreground">
                    Between 10 and 500 characters. ({question.length}/500)
                  </p>
                )}
              </div>

              {/* Question Media Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Question media (optional)
                </Label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) =>
                        void handleUploadQuestionMedia(
                          e.target.files?.[0] || null
                        )
                      }
                      disabled={uploadingQuestionMedia}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingQuestionMedia}
                      asChild>
                      <span>
                        {uploadingQuestionMedia ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="mr-2 h-4 w-4" />
                        )}
                        {questionMedia ? "Change media" : "Add media"}
                      </span>
                    </Button>
                  </label>
                  {questionMedia && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {questionMedia.type === "video"
                          ? "Video attached"
                          : "Image attached"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuestionMedia(undefined)}
                        className="h-6 w-6 p-0"
                        aria-label="Remove question media">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Poll Options - Redesigned */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Poll Options *</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddOption}
                    disabled={options.length >= 5}
                    aria-label="Add poll option"
                    className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add option
                  </Button>
                </div>
                <div className="space-y-3">
                  {options.map((opt, index) => (
                    <div
                      key={opt.id}
                      className="flex flex-col gap-2 rounded-lg border border-border p-4 bg-card hover:border-primary/50 transition-colors md:flex-row md:items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {index + 1}
                          </span>
                          <Input
                            value={opt.text}
                            onChange={(e) => {
                              handleOptionChange(opt.id, e.target.value);
                              if (validationErrors.options) {
                                setValidationErrors((prev) => ({
                                  ...prev,
                                  options: undefined,
                                }));
                              }
                            }}
                            placeholder={`Enter option ${index + 1}`}
                            maxLength={200}
                            aria-label={`Poll option ${index + 1}`}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-2 pl-8">
                          <label className="inline-flex items-center gap-1 cursor-pointer">
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
                              disabled={uploadingOptionId === opt.id}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={uploadingOptionId === opt.id}
                              asChild>
                              <span className="text-xs">
                                {uploadingOptionId === opt.id ? (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                  <ImageIcon className="mr-1 h-3 w-3" />
                                )}
                                {opt.media ? "Change" : "Add media"}
                              </span>
                            </Button>
                          </label>
                          {opt.media && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>
                                {opt.media.type === "video" ? "Video" : "Image"}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setOptions((prev) =>
                                    prev.map((o) =>
                                      o.id === opt.id
                                        ? { ...o, media: undefined }
                                        : o
                                    )
                                  )
                                }
                                className="h-5 w-5 p-0"
                                aria-label={`Remove media from option ${
                                  index + 1
                                }`}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end md:w-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(opt.id)}
                          disabled={options.length <= 2}
                          aria-label={`Remove option ${index + 1}`}
                          className="text-destructive hover:text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {validationErrors.options ? (
                  <p className="text-xs text-red-500" role="alert">
                    {validationErrors.options}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Provide between 2 and 5 unique options. Each option can have
                    optional media.
                  </p>
                )}
              </div>

              {/* Settings and Duration - Redesigned */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Poll Settings</Label>
                  <div className="space-y-3 rounded-lg border border-border p-4 bg-card">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input accent-primary"
                        checked={settings.allowMultiple}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            allowMultiple: e.target.checked,
                          }))
                        }
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          Allow multiple selections
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Users can select more than one option
                        </p>
                      </div>
                    </label>
                    <div className="space-y-2">
                      <Label
                        htmlFor="results-visibility"
                        className="text-sm font-medium">
                        Results visibility
                      </Label>
                      <select
                        id="results-visibility"
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        value={settings.showResults}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            showResults: e.target.value as ResultsVisibility,
                          }))
                        }>
                        <option value="always">Always visible</option>
                        <option value="afterVote">After user votes</option>
                        <option value="afterExpiry">After poll expires</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Control when voters can see results
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="poll-expiry" className="text-sm font-medium">
                    Poll Duration
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="poll-expiry"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => {
                        setExpiresAt(e.target.value);
                        if (validationErrors.expiresAt) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            expiresAt: undefined,
                          }));
                        }
                      }}
                      className={cn(
                        "h-10",
                        validationErrors.expiresAt && "border-red-500"
                      )}
                      aria-invalid={!!validationErrors.expiresAt}
                      aria-describedby={
                        validationErrors.expiresAt
                          ? "expiry-error"
                          : "expiry-help"
                      }
                    />
                    {validationErrors.expiresAt ? (
                      <p
                        id="expiry-error"
                        className="text-xs text-red-500"
                        role="alert">
                        {validationErrors.expiresAt}
                      </p>
                    ) : (
                      <p
                        id="expiry-help"
                        className="text-xs text-muted-foreground">
                        Set when voting should close. Leave empty for no expiry.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button - Redesigned */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {canSubmit
                    ? "Ready to publish your poll"
                    : "Fill in all required fields to continue"}
                </p>
                <Button
                  type="button"
                  disabled={!canSubmit || submitting}
                  onClick={() => void handleSubmit()}
                  size="lg"
                  className="min-w-[140px]">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Poll"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - My Recent Polls */}
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
