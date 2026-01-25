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
}: {
  options: LocalOption[];
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onOptionChange: (id: string, value: string) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
          Options
        </h3>
        <span className="text-[11px] font-bold text-[#64748b]">
          Add up to 5 options
        </span>
      </div>

      <div className="space-y-4">
        {options.map((opt, index) => (
          <div
            key={opt.id}
            className="group flex items-center gap-4 p-3 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#2563eb]/30 transition-all duration-300">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0f121a] border border-white/5 font-bold text-[#2563eb] shadow-inner">
              {index + 1}
            </div>

            <div className="flex-1 space-y-4">
              <input
                value={opt.text}
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
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/10 p-0"
              />
            </div>

            <button
              onClick={() => onRemoveOption(opt.id)}
              disabled={options.length <= 2}
              className={cn(
                "p-2 rounded-xl transition-all",
                options.length <= 2
                  ? "opacity-0 cursor-default"
                  : "text-[#64748b] hover:text-destructive hover:bg-destructive/10"
              )}>
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide">
        <span
          className={
            validationErrors.options ? "text-destructive" : "text-[#64748b]"
          }>
          {validationErrors.options || "2 to 5 options required"}
        </span>
      </div>

      <button
        type="button"
        onClick={onAddOption}
        disabled={options.length >= 5}
        className={cn(
          "w-full rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-3 text-center text-sm font-bold transition-all",
          options.length >= 5
            ? "text-[#64748b] cursor-not-allowed opacity-50"
            : "text-[#2563eb] hover:border-[#2563eb]/50 hover:bg-[#2563eb]/5"
        )}>
        <span className="inline-flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          Add another option
        </span>
      </button>
    </div>
  );
}
