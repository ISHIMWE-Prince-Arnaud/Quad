import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Dispatch, SetStateAction } from "react";

import type { PollDuration, PollSettingsState, ValidationErrors } from "./types";

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
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-white">Vote Anonymously</span>
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

      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
          Duration
        </h3>
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-3">
          <Label
            htmlFor="poll-duration"
            className="sr-only">
            Duration
          </Label>
          <select
            id="poll-duration"
            className={cn(
              "h-10 w-full rounded-xl border border-white/10 bg-[#0f121a] px-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50 transition-all appearance-none cursor-pointer",
              validationErrors.expiresAt && "border-destructive/50"
            )}
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value as PollDuration);
              if (validationErrors.expiresAt) {
                setValidationErrors((prev) => ({
                  ...prev,
                  expiresAt: undefined,
                }));
              }
            }}>
            <option value="none">none</option>
            <option value="1d">1 day</option>
            <option value="1w">1 week</option>
            <option value="1m">1 month</option>
          </select>
        </div>
      </div>
    </div>
  );
}
