import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  canSubmit,
  submitting,
  onSubmit,

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
  setSettings: (next: PollSettingsState | ((prev: PollSettingsState) => PollSettingsState)) => void;
  duration: PollDuration;
  setDuration: (v: PollDuration) => void;

  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;

  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}) {
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl">Create Poll</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Ask a question and let your community vote
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
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

        <PollOptionsEditor
          options={options}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onOptionChange={onOptionChange}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
        />

        <PollSettingsAndDuration
          settings={settings}
          setSettings={setSettings}
          duration={duration}
          setDuration={setDuration}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
        />

        <PollSubmitBar
          canSubmit={canSubmit}
          submitting={submitting}
          onSubmit={onSubmit}
        />
      </CardContent>
    </Card>
  );
}
