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
  disabled,
  validationErrors,
  setValidationErrors,
}: {
  settings: PollSettingsState;
  setSettings: Dispatch<SetStateAction<PollSettingsState>>;
  duration?: PollDuration;
  setDuration?: (v: PollDuration) => void;
  disabled?: boolean;
  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Anonymity
        </h3>
        <div className="rounded-2xl bg-muted/20 border border-border/40 px-4 py-3">
          <div className="h-11 w-full rounded-2xl border border-border/40 bg-card px-4 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
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
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Duration
        </h3>
        <div className="rounded-2xl bg-muted/20 border border-border/40 px-4 py-3">
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
                "h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all",
                validationErrors.expiresAt && "border-destructive/50",
              )}>
              {duration ? durationLabel[duration] : "none"}
            </SelectTrigger>
            <SelectContent className="mt-2 rounded-2xl border border-border/40 bg-popover p-2 shadow-xl backdrop-blur-xl">
              <SelectItem
                className="rounded-xl focus:bg-accent focus:text-accent-foreground"
                value="none">
                none
              </SelectItem>
              <SelectItem
                className="rounded-xl focus:bg-accent focus:text-accent-foreground"
                value="1d">
                1 day
              </SelectItem>
              <SelectItem
                className="rounded-xl focus:bg-accent focus:text-accent-foreground"
                value="1w">
                1 week
              </SelectItem>
              <SelectItem
                className="rounded-xl focus:bg-accent focus:text-accent-foreground"
                value="1m">
                1 month
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
