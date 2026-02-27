import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiArrowLeftBold } from "react-icons/pi";
import { UploadService } from "@/services/uploadService";
import { PollService } from "@/services/pollService";
import type { Poll, PollMedia, CreatePollInput } from "@/types/poll";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";
import { ZodError } from "zod";
import type { ZodIssue } from "zod";
import { createPollSchema } from "@/schemas/poll.schema";
import { CreatePollForm } from "./create-poll/CreatePollForm";
import { getErrorMessage } from "./create-poll/getErrorMessage";
import { mapFileToMedia } from "./create-poll/pollUtils";
import type {
  LocalOption,
  PollDuration,
  PollSettingsState,
  ValidationErrors,
} from "./create-poll/types";
import { logError } from "@/lib/errorHandling";
import { Button } from "@/components/ui/button";

export default function CreatePollPage() {
  const navigate = useNavigate();

  // State
  const [question, setQuestion] = useState("");
  const [questionMedia, setQuestionMedia] = useState<PollMedia | undefined>();
  const [options, setOptions] = useState<LocalOption[]>([
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
  ]);
  const [settings, setSettings] = useState<PollSettingsState>({
    anonymousVoting: false,
  });
  const [duration, setDuration] = useState<PollDuration>("1d");

  const [submitting, setSubmitting] = useState(false);
  const [uploadingQuestionMedia, setUploadingQuestionMedia] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  // Handlers
  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions((prev) => [...prev, { id: crypto.randomUUID(), text: "" }]);
    }
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((opt) => opt.id !== id));
    }
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt)),
    );
    if (validationErrors.options) {
      setValidationErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  const handleUploadQuestionMedia = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showErrorToast("Images only");
      return;
    }
    try {
      setUploadingQuestionMedia(true);
      const res = await UploadService.uploadPollMedia(file);
      setQuestionMedia(mapFileToMedia(file, res.url));
      showSuccessToast("Media attached");
    } catch (error) {
      logError(error, {
        component: "CreatePollPage",
        action: "uploadQuestionMedia",
      });
      showErrorToast(getErrorMessage(error));
    } finally {
      setUploadingQuestionMedia(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

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
        options: finalOptions.map((o) => ({ text: o.text })),
        settings: {
          anonymousVoting: settings.anonymousVoting,
        },
        expiresAt:
          duration === "none"
            ? undefined
            : new Date(
                Date.now() +
                  (duration === "1d"
                    ? 24 * 60 * 60 * 1000
                    : duration === "1w"
                      ? 7 * 24 * 60 * 60 * 1000
                      : 30 * 24 * 60 * 60 * 1000),
              ).toISOString(),
      };

      // Validate with Zod schema
      try {
        createPollSchema.parse(payload);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          const errors: ValidationErrors = {};
          validationError.issues.forEach((issue: ZodIssue) => {
            const path0 = issue.path[0];
            if (path0 === "question") {
              errors.question = issue.message;
            } else if (path0 === "options") {
              errors.options = issue.message;
            } else if (path0 === "expiresAt") {
              errors.expiresAt = issue.message;
            } else {
              errors.general = issue.message;
            }
          });
          setValidationErrors(errors);
          showErrorToast(errors.general || "Fix validation errors");
          return;
        }
        throw validationError;
      }

      const res = await PollService.create(payload);
      if (!res.success || !res.data) {
        showErrorToast(res.message || "Failed to create poll");
        return;
      }

      showSuccessToast("Poll created");
      const created = res.data as unknown as Record<string, unknown>;
      const createdId =
        (typeof created.id === "string" && created.id) ||
        (typeof created._id === "string" && created._id) ||
        undefined;

      const normalizedPoll = {
        ...(res.data as Poll),
        ...(createdId ? { id: createdId } : {}),
      };

      navigate("/app/polls", { state: { createdPoll: normalizedPoll } });
    } catch (error) {
      logError(error, { component: "CreatePollPage", action: "submitPoll" });
      showErrorToast(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="mx-auto w-full px-3 py-4 sm:px-4 sm:py-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-all"
            onClick={() => navigate("/app/polls")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary group-hover:bg-accent transition-colors">
              <PiArrowLeftBold className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </div>
            <span className="text-xl tracking-tight">Create Poll</span>
          </button>

          <Button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={() => void handleSubmit()}
            className="h-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4">
            Post
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
          duration={duration}
          setDuration={setDuration}
          canSubmit={canSubmit}
          submitting={submitting}
          onSubmit={() => void handleSubmit()}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
        />
      </div>
    </div>
  );
}
