import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import type { LocalOption, ValidationErrors } from "./types";

export function PollOptionsEditor({
  options,
  onAddOption,
  onRemoveOption,
  onOptionChange,
  validationErrors,
  setValidationErrors,
  disabled,
}: {
  options: LocalOption[];
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onOptionChange: (id: string, value: string) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Options
        </h3>
        <span className="text-[11px] font-bold text-muted-foreground">
          Add up to 5 options
        </span>
      </div>

      <div className="space-y-4">
        {options.map((opt, index) => (
          <div
            key={opt.id}
            className="group flex items-center gap-4 p-3 rounded-3xl bg-muted/10 border border-border/40 hover:border-primary/30 transition-all duration-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card border border-border/40 font-bold text-primary shadow-inner">
              {index + 1}
            </div>

            <div className="flex-1 space-y-4">
              <input
                value={opt.text}
                disabled={disabled}
                onChange={(e) => {
                  onOptionChange(opt.id, e.target.value);
                  if (validationErrors.options) {
                    setValidationErrors((prev: ValidationErrors) => ({
                      ...prev,
                      options: undefined,
                    }));
                  }
                }}
                placeholder={`Option ${index + 1}`}
                maxLength={200}
                className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 p-0"
              />
            </div>

            <button
              onClick={() => onRemoveOption(opt.id)}
              disabled={disabled || options.length <= 2}
              className={cn(
                "p-2 rounded-xl transition-all",
                disabled || options.length <= 2
                  ? "opacity-0 cursor-default"
                  : "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              )}>
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide">
        <span
          className={
            validationErrors.options
              ? "text-destructive"
              : "text-muted-foreground"
          }>
          {validationErrors.options || "2 to 5 options required"}
        </span>
      </div>

      <button
        type="button"
        onClick={onAddOption}
        disabled={disabled || options.length >= 5}
        className={cn(
          "w-full rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-center text-sm font-bold transition-all",
          disabled || options.length >= 5
            ? "text-muted-foreground cursor-not-allowed opacity-50"
            : "text-primary hover:border-primary/50 hover:bg-primary/5",
        )}>
        <span className="inline-flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          Add another option
        </span>
      </button>
    </div>
  );
}
