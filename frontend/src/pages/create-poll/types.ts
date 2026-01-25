import type { ResultsVisibility } from "@/types/poll";

export interface LocalOption {
  id: string;
  text: string;
}

export interface ValidationErrors {
  question?: string;
  options?: string;
  expiresAt?: string;
  general?: string;
}

export type PollSettingsState = {
  anonymousVoting: boolean;
  showResults: ResultsVisibility;
};
