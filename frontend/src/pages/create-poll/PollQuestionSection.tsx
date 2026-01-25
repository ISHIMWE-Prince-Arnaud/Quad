import { cn } from "@/lib/utils";
import type { PollMedia } from "@/types/poll";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

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
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}) {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
          Poll Question
        </h3>
        <textarea
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
          placeholder="What's your question?"
          className={cn(
            "w-full bg-transparent border-none focus:ring-0 text-3xl font-black text-white placeholder-white/10 p-0 resize-none",
            validationErrors.question && "text-destructive"
          )}
          aria-invalid={!!validationErrors.question}
        />
        <div className="flex justify-between items-center text-[11px] font-bold text-[#64748b]">
          <span>{question.length}/500 characters</span>
          {validationErrors.question && (
            <span className="text-destructive uppercase">
              {validationErrors.question}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
          Question Media (Optional)
        </h3>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                onUploadQuestionMedia(e.target.files?.[0] || null)
              }
              disabled={uploadingQuestionMedia}
            />
            <div
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all",
                uploadingQuestionMedia
                  ? "border-[#2563eb] bg-[#2563eb]/5"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              )}>
              {uploadingQuestionMedia ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#2563eb]" />
              ) : (
                <ImageIcon className="h-5 w-5 text-[#64748b] group-hover:text-white transition-colors" />
              )}
              <span className="text-sm font-bold text-[#f1f5f9]">
                {questionMedia ? "Change Image" : "Add Image"}
              </span>
            </div>
          </label>

          {questionMedia && (
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-left-2">
              <span className="text-xs font-bold text-[#64748b]">
                Image attached
              </span>
              <button
                type="button"
                onClick={() => setQuestionMedia(undefined)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-[#64748b] hover:text-white transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
