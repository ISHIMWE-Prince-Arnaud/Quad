import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ResultsVisibility } from "@/types/poll";
import type { Dispatch, SetStateAction } from "react";

import type { PollSettingsState, ValidationErrors } from "./types";

export function PollSettingsAndDuration({
  settings,
  setSettings,
  expiresAt,
  setExpiresAt,
  validationErrors,
  setValidationErrors,
}: {
  settings: PollSettingsState;
  setSettings: Dispatch<SetStateAction<PollSettingsState>>;
  expiresAt: string | "";
  setExpiresAt: (v: string | "") => void;
  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}) {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
          Poll Settings
        </h3>
        <div className="space-y-6 rounded-[2rem] bg-white/[0.02] border border-white/5 p-6 shadow-inner">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer h-5 w-5 rounded-md border-white/10 bg-white/5 accent-[#2563eb] transition-all"
                checked={settings.allowMultiple}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    allowMultiple: e.target.checked,
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white group-hover:text-[#2563eb] transition-colors">
                Allow multiple selections
              </span>
              <p className="text-[11px] font-medium text-[#64748b]">
                Users can select more than one option
              </p>
            </div>
          </label>

          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer h-5 w-5 rounded-md border-white/10 bg-white/5 accent-[#2563eb] transition-all"
                checked={settings.anonymousVoting}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    anonymousVoting: e.target.checked,
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white group-hover:text-[#2563eb] transition-colors">
                Anonymous voting
              </span>
              <p className="text-[11px] font-medium text-[#64748b]">
                Hide voter identities from results
              </p>
            </div>
          </label>

          <div className="space-y-3 pt-2 border-t border-white/5">
            <Label
              htmlFor="results-visibility"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">
              Results visibility
            </Label>
            <select
              id="results-visibility"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0f121a] px-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50 transition-all appearance-none cursor-pointer"
              value={settings.showResults}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  showResults: e.target.value as ResultsVisibility,
                }))
              }>
              <option value="always">Always visible</option>
              <option value="afterVote">After user votes</option>
              <option value="afterExpiry">After poll expires</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
          Poll Duration
        </h3>
        <div className="space-y-4 rounded-[2rem] bg-white/[0.02] border border-white/5 p-6 shadow-inner">
          <div className="space-y-3">
            <Label
              htmlFor="poll-expiry"
              className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">
              Closing Date & Time (Optional)
            </Label>
            <div className="relative">
              <input
                id="poll-expiry"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => {
                  setExpiresAt(e.target.value);
                  if (validationErrors.expiresAt) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      expiresAt: undefined,
                    }));
                  }
                }}
                className={cn(
                  "h-12 w-full rounded-xl border border-white/10 bg-[#0f121a] px-4 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50 transition-all cursor-pointer",
                  validationErrors.expiresAt && "border-destructive/50"
                )}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
              <span
                className={
                  validationErrors.expiresAt
                    ? "text-destructive"
                    : "text-[#64748b]"
                }>
                {validationErrors.expiresAt || "Leave empty for no expiry"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
