import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { UploadService } from "@/services/uploadService";
import { PollService } from "@/services/pollService";
import type {
  PollMedia,
  PollOptionInput,
} from "@/types/poll";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { pollSchema } from "@/schemas/poll.schema";
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

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
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
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
      setQuestionMedia(mapFileToMedia(file, res.data.url));
    } catch (error) {
      logError(error, "Upload poll media");
      toast.error("Failed to upload media");
    } finally {
      setUploadingQuestionMedia(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setValidationErrors({});

      const finalOptions = options.filter((o) => o.text.trim().length > 0);

      const pollData = {
        question: question.trim(),
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
      const result = pollSchema.safeParse(pollData);

      if (!result.success) {
        const errors: ValidationErrors = {};
        result.error.issues.forEach((issue: ZodIssue) => {
          const path = issue.path[0] as string;
          if (path === "question") errors.question = issue.message;
          if (path === "options") errors.options = issue.message;
          if (path === "expiresAt") errors.expiresAt = issue.message;
        });
        setValidationErrors(errors);

        // Show toast for the first error
        const firstError = result.error.issues[0];
        toast.error(getErrorMessage(firstError));
        return;
      }

      const res = await PollService.createPoll({
        question: pollData.question,
        questionMedia: pollData.questionMedia,
        options: pollData.options as PollOptionInput[],
        settings: pollData.settings,
        expiresAt: pollData.expiresAt,
      });

      if (res.success) {
        toast.success("Poll created successfully!");
        navigate("/app/polls");
      }
    } catch (error) {
      logError(error, "Create poll");
      toast.error("Failed to create poll");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = useMemo(() => {
    return (
      question.trim().length >= 5 &&
      options.filter((o) => o.text.trim().length > 0).length >= 2
    );
  }, [question, options]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-bold"
            onClick={() => navigate("/app/polls")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-base">Create Poll</span>
          </button>

          <Button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={() => void handleSubmit()}
            className="h-8 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-4"
          >
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