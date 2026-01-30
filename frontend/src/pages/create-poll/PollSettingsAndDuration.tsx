import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Dispatch, SetStateAction } from "react";

import type {
  PollDuration,
  PollSettingsState,
  ValidationErrors,
} from "./types";

const durationLabel: Record<PollDuration, string> = {
  none: "none",
  "1d": "1 day",
  "1w": "1 week",
  "1m": "1 month",
};

export function PollSettingsAndDuration({
  settings,
  setSettings,
  duration,
  setDuration,
  validationErrors,
  setValidationErrors,
}: {
  settings: PollSettingsState;
  setSettings: Dispatch<SetStateAction<PollSettingsState>>;
  duration: PollDuration;
  setDuration: (v: PollDuration) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
          Anonymity
        </h3>
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-3">
          <div className="h-11 w-full rounded-2xl border border-white/15 bg-[#0f121a] px-4 flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              Vote Anonymously
            </span>
            <Switch
              checked={settings.anonymousVoting}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  anonymousVoting: e.target.checked,
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
          Duration
        </h3>
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-3">
          <Label htmlFor="poll-duration" className="sr-only">
            Duration
          </Label>
          <Select
            value={duration}
            onValueChange={(v) => {
              setDuration(v as PollDuration);
              if (validationErrors.expiresAt) {
                setValidationErrors((prev) => ({
                  ...prev,
                  expiresAt: undefined,
                }));
              }
            }}
            className="w-full">
            <SelectTrigger
              id="poll-duration"
              className={cn(
                "h-11 w-full rounded-2xl border border-white/15 bg-[#0f121a] px-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]/40 transition-all",
                validationErrors.expiresAt && "border-destructive/50",
              )}>
              {durationLabel[duration]}
            </SelectTrigger>
            <SelectContent className="mt-2 rounded-2xl border border-white/10 bg-[#0f121a] p-2 shadow-xl">
              <SelectItem className="rounded-xl" value="none">
                none
              </SelectItem>
              <SelectItem className="rounded-xl" value="1d">
                1 day
              </SelectItem>
              <SelectItem className="rounded-xl" value="1w">
                1 week
              </SelectItem>
              <SelectItem className="rounded-xl" value="1m">
                1 month
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
