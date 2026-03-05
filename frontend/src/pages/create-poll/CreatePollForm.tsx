import type { Dispatch, SetStateAction } from "react";
import type { PollMedia } from "@/types/poll";

import type {
  LocalOption,
  PollDuration,
  PollSettingsState,
  ValidationErrors,
} from "./types";
import { PollOptionsEditor } from "./PollOptionsEditor";
import { PollQuestionSection } from "./PollQuestionSection";
import { PollSettingsAndDuration } from "./PollSettingsAndDuration";
import { PollSubmitBar } from "./PollSubmitBar";

export function CreatePollForm({
  question,
  setQuestion,
  questionMedia,
  setQuestionMedia,
  uploadingQuestionMedia,
  onUploadQuestionMedia,

  options,
  onAddOption,
  onRemoveOption,
  onOptionChange,

  settings,
  setSettings,
  duration,
  setDuration,
  optionsDisabled,
  restrictedDisabled,

  canSubmit,
  submitting,
  onSubmit,
  submitLabel,
  submitSubmittingLabel,

  validationErrors,
  setValidationErrors,
}: {
  question: string;
  setQuestion: (v: string) => void;
  questionMedia: PollMedia | undefined;
  setQuestionMedia: (m: PollMedia | undefined) => void;
  uploadingQuestionMedia: boolean;
  onUploadQuestionMedia: (file: File | null) => void;

  options: LocalOption[];
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onOptionChange: (id: string, value: string) => void;

  settings: PollSettingsState;
  setSettings: (
    next: PollSettingsState | ((prev: PollSettingsState) => PollSettingsState),
  ) => void;
  duration?: PollDuration;
  setDuration?: (v: PollDuration) => void;
  optionsDisabled?: boolean;
  restrictedDisabled?: boolean;

  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  submitSubmittingLabel?: string;

  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}) {
  return (
    <div className="space-y-6">
      {/* Main document card — mirrors CreateStoryForm's single-card approach */}
      <div className="rounded-[2rem] border border-border/40 bg-card shadow-sm overflow-hidden">
        {/* Question Zone */}
        <div className="p-6 md:p-8 space-y-5">
          <PollQuestionSection
            question={question}
            setQuestion={setQuestion}
            questionMedia={questionMedia}
            setQuestionMedia={setQuestionMedia}
            uploadingQuestionMedia={uploadingQuestionMedia}
            onUploadQuestionMedia={onUploadQuestionMedia}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border/40" />

        {/* Options Zone */}
        <div className="p-6 md:p-8">
          <PollOptionsEditor
            options={options}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
            onOptionChange={onOptionChange}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            disabled={optionsDisabled}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-border/40" />

        {/* Settings Zone */}
        <div className="p-6 md:p-8">
          <PollSettingsAndDuration
            settings={settings}
            setSettings={setSettings}
            duration={duration}
            setDuration={setDuration}
            disabled={restrictedDisabled}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        </div>
      </div>

      <PollSubmitBar
        canSubmit={canSubmit}
        submitting={submitting}
        onSubmit={onSubmit}
        label={submitLabel}
        submittingLabel={submitSubmittingLabel}
      />
    </div>
  );
}
