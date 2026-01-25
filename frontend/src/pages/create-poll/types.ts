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

export type PollDuration = "none" | "1d" | "1w" | "1m";

export type PollSettingsState = {
  anonymousVoting: boolean;
};
