import type { PollMedia, ResultsVisibility } from "@/types/poll";

export interface LocalOption {
  id: string;
  text: string;
  media?: PollMedia;
}

export interface ValidationErrors {
  question?: string;
  options?: string;
  expiresAt?: string;
  general?: string;
}

export type PollSettingsState = {
  allowMultiple: boolean;
  anonymousVoting: boolean;
  showResults: ResultsVisibility;
};
