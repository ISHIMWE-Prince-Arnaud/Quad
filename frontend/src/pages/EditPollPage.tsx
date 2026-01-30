import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { PollService } from "@/services/pollService";
import { UploadService } from "@/services/uploadService";
import type { Poll, PollMedia } from "@/types/poll";
import { logError } from "@/lib/errorHandling";

import type {
  LocalOption,
  PollSettingsState,
  ValidationErrors,
} from "./create-poll/types";
import { CreatePollForm } from "./create-poll/CreatePollForm";
import { getErrorMessage } from "./create-poll/getErrorMessage";
import { mapFileToMedia } from "./create-poll/pollUtils";

export default function EditPollPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [questionMedia, setQuestionMedia] = useState<PollMedia | undefined>();
  const [options, setOptions] = useState<LocalOption[]>([]);
  const [settings, setSettings] = useState<PollSettingsState>({
    anonymousVoting: false,
  });
  const [expiresAtLocal, setExpiresAtLocal] = useState<string>("");
  const [uploadingQuestionMedia, setUploadingQuestionMedia] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toDatetimeLocal = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (!id) {
      setError("Poll ID is required");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await PollService.getById(id);
        if (!res.success || !res.data) {
          throw new Error(res.message || "Failed to load poll");
        }

        if (cancelled) return;

        setPoll(res.data);
        setQuestion(res.data.question ?? "");
        setQuestionMedia(res.data.questionMedia);
        setOptions(
          (res.data.options || []).map((opt) => ({
            id: crypto.randomUUID(),
            text: opt.text,
          })),
        );
        setSettings({
          anonymousVoting: Boolean(res.data.settings?.anonymousVoting),
        });
        setExpiresAtLocal(
          res.data.expiresAt ? toDatetimeLocal(res.data.expiresAt) : "",
        );
      } catch (err: unknown) {
        logError(err, {
          component: "EditPollPage",
          action: "fetchPoll",
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
  }, [id]);

  const canSubmit = useMemo(() => {
    const q = question.trim();
    const filledOptions = options
      .map((o) => o.text.trim())
      .filter((t) => t.length > 0);
    return (
      q.length >= 10 &&
      q.length <= 500 &&
      filledOptions.length >= 2 &&
      filledOptions.length <= 5 &&
      !isSubmitting
    );
  }, [question, options, isSubmitting]);

  const now = new Date();
  const expiresAtDate = poll?.expiresAt ? new Date(poll.expiresAt) : null;
  const isExpiredByTime = Boolean(
    expiresAtDate &&
    !Number.isNaN(expiresAtDate.getTime()) &&
    expiresAtDate.getTime() <= now.getTime(),
  );
  const isExpired = poll?.status === "expired" || isExpiredByTime;
  const canEditRestricted = !isExpired;
  const canEditOptions = canEditRestricted && (poll?.totalVotes ?? 0) === 0;

  const handleAddOption = () => {
    if (!canEditOptions) return;
    if (options.length < 5) {
      setOptions((prev) => [...prev, { id: crypto.randomUUID(), text: "" }]);
    }
  };

  const handleRemoveOption = (optId: string) => {
    if (!canEditOptions) return;
    if (options.length > 2) {
      setOptions((prev) => prev.filter((opt) => opt.id !== optId));
    }
  };

  const handleOptionChange = (optId: string, text: string) => {
    if (!canEditOptions) return;
    setOptions((prev) =>
      prev.map((opt) => (opt.id === optId ? { ...opt, text } : opt)),
    );
    if (validationErrors.options) {
      setValidationErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  const handleUploadQuestionMedia = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only images are allowed for polls");
      return;
    }

    try {
      setUploadingQuestionMedia(true);
      const res = await UploadService.uploadPollMedia(file);
      setQuestionMedia(mapFileToMedia(file, res.url));
      toast.success("Question media updated");
    } catch (err: unknown) {
      logError(err, {
        component: "EditPollPage",
        action: "uploadQuestionMedia",
      });
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingQuestionMedia(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (isSubmitting) return;

    setValidationErrors({});

    const trimmed = question.trim();
    if (trimmed.length < 10) {
      setValidationErrors({
        question: "Question must be at least 10 characters",
      });
      toast.error("Please fix validation errors before saving");
      return;
    }

    const finalOptions = options
      .map((o) => ({ ...o, text: o.text.trim() }))
      .filter((o) => o.text.length > 0)
      .slice(0, 5);

    if (finalOptions.length < 2) {
      setValidationErrors((prev) => ({
        ...prev,
        options: "Poll must have at least 2 options",
      }));
      toast.error("Please fix validation errors before saving");
      return;
    }

    if (canEditRestricted && expiresAtLocal) {
      const d = new Date(expiresAtLocal);
      if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) {
        setValidationErrors((prev) => ({
          ...prev,
          expiresAt: "Expiration date must be in the future",
        }));
        toast.error("Please fix validation errors before saving");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload = {
        question: trimmed,
        questionMedia,
        ...(canEditRestricted
          ? {
              settings: {
                anonymousVoting: settings.anonymousVoting,
              },
              expiresAt: expiresAtLocal
                ? new Date(expiresAtLocal).toISOString()
                : null,
              ...(canEditOptions
                ? { options: finalOptions.map((o) => ({ text: o.text })) }
                : {}),
            }
          : {}),
      };

      const res = await PollService.update(id, payload);

      if (!res.success) {
        throw new Error(res.message || "Failed to update poll");
      }

      toast.success("Poll updated successfully!");
      navigate("/app/polls");
    } catch (err: unknown) {
      logError(err, {
        component: "EditPollPage",
        action: "updatePoll",
        metadata: { id },
      });
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Unable to edit poll</h2>
          <p className="text-muted-foreground mb-4">
            {error ||
              "The poll you are trying to edit does not exist or cannot be loaded."}
          </p>
          <Button onClick={() => navigate("/app/polls")}>Back to Polls</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-3 py-4 sm:px-4 sm:py-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-bold"
            onClick={() => navigate("/app/polls")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="text-base">Edit Poll</span>
          </button>

          <Button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
            className="h-8 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-4">
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>

        <CreatePollForm
          question={question}
          setQuestion={setQuestion}
          questionMedia={questionMedia}
          setQuestionMedia={setQuestionMedia}
          uploadingQuestionMedia={uploadingQuestionMedia}
          onUploadQuestionMedia={handleUploadQuestionMedia}
          options={options}
          onAddOption={handleAddOption}
          onRemoveOption={handleRemoveOption}
          onOptionChange={handleOptionChange}
          settings={settings}
          setSettings={setSettings}
          expiresAtLocal={expiresAtLocal}
          setExpiresAtLocal={setExpiresAtLocal}
          mode="edit"
          optionsDisabled={!canEditOptions}
          restrictedDisabled={!canEditRestricted}
          canSubmit={canSubmit}
          submitting={isSubmitting}
          onSubmit={() => void handleSubmit()}
          submitLabel="Save"
          submitSubmittingLabel="Saving..."
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
        />
      </div>
    </div>
  );
}
