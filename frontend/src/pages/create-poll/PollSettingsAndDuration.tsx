import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ResultsVisibility } from "@/types/poll";

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
  setSettings: React.Dispatch<React.SetStateAction<PollSettingsState>>;
  expiresAt: string | "";
  setExpiresAt: (v: string | "") => void;
  validationErrors: ValidationErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Poll Settings</Label>
        <div className="space-y-3 rounded-lg border border-border p-4 bg-card">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              checked={settings.allowMultiple}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  allowMultiple: e.target.checked,
                }))
              }
            />
            <div className="flex-1">
              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                Allow multiple selections
              </span>
              <p className="text-xs text-muted-foreground">
                Users can select more than one option
              </p>
            </div>
          </label>

          <div className="space-y-2">
            <Label htmlFor="results-visibility" className="text-sm font-medium">
              Results visibility
            </Label>
            <select
              id="results-visibility"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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
            <p className="text-xs text-muted-foreground">
              Control when voters can see results
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="poll-expiry" className="text-sm font-medium">
          Poll Duration
        </Label>
        <div className="space-y-2">
          <Input
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
            className={cn("h-10", validationErrors.expiresAt && "border-red-500")}
            aria-invalid={!!validationErrors.expiresAt}
            aria-describedby={
              validationErrors.expiresAt ? "expiry-error" : "expiry-help"
            }
          />
          {validationErrors.expiresAt ? (
            <p id="expiry-error" className="text-xs text-red-500" role="alert">
              {validationErrors.expiresAt}
            </p>
          ) : (
            <p id="expiry-help" className="text-xs text-muted-foreground">
              Set when voting should close. Leave empty for no expiry.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
