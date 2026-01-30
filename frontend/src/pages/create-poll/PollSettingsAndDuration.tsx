import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
  expiresAtLocal,
  setExpiresAtLocal,
  mode,
  disabled,
  validationErrors,
  setValidationErrors,
}: {
  settings: PollSettingsState;
  setSettings: Dispatch<SetStateAction<PollSettingsState>>;
  duration?: PollDuration;
  setDuration?: (v: PollDuration) => void;
  expiresAtLocal?: string;
  setExpiresAtLocal?: Dispatch<SetStateAction<string>>;
  mode?: "create" | "edit";
  disabled?: boolean;
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
              disabled={disabled}
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
          {mode === "edit" ? "Expires At" : "Duration"}
        </h3>
        {mode === "edit" ? (
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-3 space-y-3">
            <input
              type="datetime-local"
              value={expiresAtLocal || ""}
              disabled={disabled}
              onChange={(e) => {
                setExpiresAtLocal?.(e.target.value);
                if (validationErrors.expiresAt) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    expiresAt: undefined,
                  }));
                }
              }}
              className={cn(
                "h-11 w-full rounded-2xl border border-white/15 bg-[#0f121a] px-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]/40 transition-all disabled:opacity-50",
                validationErrors.expiresAt && "border-destructive/50",
              )}
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
                {validationErrors.expiresAt ||
                  (!expiresAtLocal ? "No expiry" : "")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || !expiresAtLocal}
                onClick={() => setExpiresAtLocal?.("")}
                className="h-8 rounded-full">
                Clear
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-3">
            <Label htmlFor="poll-duration" className="sr-only">
              Duration
            </Label>
            <Select
              value={duration}
              onValueChange={(v) => {
                if (disabled) return;
                setDuration?.(v as PollDuration);
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
                disabled={disabled}
                className={cn(
                  "h-11 w-full rounded-2xl border border-white/15 bg-[#0f121a] px-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]/40 transition-all",
                  validationErrors.expiresAt && "border-destructive/50",
                )}>
                {duration ? durationLabel[duration] : "none"}
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
        )}
      </div>
    </div>
  );
}
