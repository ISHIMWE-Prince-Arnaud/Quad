import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PollMedia } from "@/types/poll";
import { Image as ImageIcon, Loader2, X } from "lucide-react";

import type { ValidationErrors } from "./types";

export function PollQuestionSection({
  question,
  setQuestion,
  questionMedia,
  setQuestionMedia,
  uploadingQuestionMedia,
  onUploadQuestionMedia,
  validationErrors,
  setValidationErrors,
}: {
  question: string;
  setQuestion: (v: string) => void;
  questionMedia: PollMedia | undefined;
  setQuestionMedia: (m: PollMedia | undefined) => void;
  uploadingQuestionMedia: boolean;
  onUploadQuestionMedia: (file: File | null) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}) {
  return (
    <>
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
            validationErrors.question ? "question-error" : "question-help"
          }
        />
        {validationErrors.question ? (
          <p id="question-error" className="text-xs text-red-500" role="alert">
            {validationErrors.question}
          </p>
        ) : (
          <p id="question-help" className="text-xs text-muted-foreground">
            Between 10 and 500 characters. ({question.length}/500)
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Question media (optional)</Label>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => onUploadQuestionMedia(e.target.files?.[0] || null)}
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
                {questionMedia.type === "video" ? "Video attached" : "Image attached"}
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
    </>
  );
}
