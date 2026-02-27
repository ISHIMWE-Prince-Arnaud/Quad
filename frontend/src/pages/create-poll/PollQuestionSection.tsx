import { cn } from "@/lib/utils";
import type { PollMedia } from "@/types/poll";
import {
  PiImageBold as ImageIcon,
  PiSpinnerBold,
  PiXBold,
} from "react-icons/pi";
import { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { ValidationErrors } from "./types";
import { Button } from "@/components/ui/button";

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    if (uploadingQuestionMedia) return;
    inputRef.current?.click();
  };

  const trimmedQuestionLength = question.trim().length;

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Poll Question
        </h3>

        <div
          className={cn(
            "rounded-2xl border border-border/40 bg-muted/20 px-4 py-3 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-colors",
            validationErrors.question && "border-destructive/60",
          )}>
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
            placeholder="What's on your mind?"
            className={cn(
              "w-full bg-transparent border-none focus:ring-0 text-base font-semibold text-foreground placeholder:text-muted-foreground/60 p-0 resize-none",
              validationErrors.question && "text-destructive",
            )}
            aria-invalid={!!validationErrors.question}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
          <span>{question.length}/500</span>
          {validationErrors.question ? (
            <span className="text-destructive">
              {validationErrors.question}
            </span>
          ) : trimmedQuestionLength > 0 && trimmedQuestionLength < 10 ? (
            <span className="text-muted-foreground/60">
              Minimum 10 characters
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Media
        </h3>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onUploadQuestionMedia(e.target.files?.[0] || null)}
          disabled={uploadingQuestionMedia}
        />

        {!questionMedia && (
          <div
            className={cn(
              "relative border border-dashed rounded-[2rem] px-6 py-10 text-center transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              uploadingQuestionMedia
                ? "border-primary bg-primary/5"
                : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/30",
            )}
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith("image/")) {
                onUploadQuestionMedia(file);
              }
            }}>
            <div className="flex flex-col items-center gap-3">
              {uploadingQuestionMedia ? (
                <>
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <PiSpinnerBold className="h-5 w-5 animate-spin text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-[#64748b]">
                    Uploading image...
                  </p>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Add a photo (optional)
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-1">
                      Drag & drop or click to upload
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {questionMedia && (
          <div
            className="group relative overflow-hidden rounded-[2rem] border border-border/40 bg-muted/20"
            tabIndex={0}>
            <img
              src={questionMedia.url}
              alt="poll media"
              className="w-full max-h-80 object-cover"
            />

            {uploadingQuestionMedia && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="flex items-center gap-3 rounded-full border border-border/40 bg-card/70 px-4 py-2 backdrop-blur-sm">
                  <PiSpinnerBold className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Uploading...
                  </span>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />

            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploadingQuestionMedia}
                className="h-8 rounded-full border border-border/40 bg-muted/40 hover:bg-muted/60 text-foreground font-semibold px-4"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openFilePicker();
                }}>
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={uploadingQuestionMedia}
                className="h-8 rounded-full px-4"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuestionMedia(undefined);
                }}>
                <PiXBold className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
