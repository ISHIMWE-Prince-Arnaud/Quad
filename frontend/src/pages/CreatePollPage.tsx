import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadService } from "@/services/uploadService";
import { PollService } from "@/services/pollService";
import type {
  CreatePollInput,
  PollMedia,
} from "@/types/poll";
import { createPollSchema } from "@/schemas/poll.schema";
import toast from "react-hot-toast";
import { ZodError } from "zod";
import type { ZodIssue } from "zod";
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
  const [settings, setSettings] = useState<PollSettingsState>({
    anonymousVoting: false,
  });
  const [duration, setDuration] = useState<PollDuration>("none");

  const [submitting, setSubmitting] = useState(false);
  const [uploadingQuestionMedia, setUploadingQuestionMedia] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

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

  const handleUploadQuestionMedia = async (file: File | null) => {
    if (!file) return;
    try {
      setUploadingQuestionMedia(true);
      const res = await UploadService.uploadPollMedia(file);
      setQuestionMedia(mapFileToMedia(file, res.url));
      toast.success("Question media attached");
    } catch (err) {
      logError(err, { component: "CreatePollPage", action: "uploadQuestionMedia" });
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingQuestionMedia(false);
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
                      : 30 * 24 * 60 * 60 * 1000)
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
      navigate("/app/polls");
    } catch (err) {
      logError(err, { component: "CreatePollPage", action: "submitPoll" });
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <CreatePollForm
          question={question}
          setQuestion={setQuestion}
          questionMedia={questionMedia}
          setQuestionMedia={setQuestionMedia}
          uploadingQuestionMedia={uploadingQuestionMedia}
          onUploadQuestionMedia={(file) => void handleUploadQuestionMedia(file)}
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
