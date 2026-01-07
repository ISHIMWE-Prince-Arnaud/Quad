import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Loader2, Plus, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import type { LocalOption, ValidationErrors } from "./types";

export function PollOptionsEditor({
  options,
  setOptions,
  uploadingOptionId,
  onAddOption,
  onRemoveOption,
  onOptionChange,
  onUploadOptionMedia,
  validationErrors,
  setValidationErrors,
}: {
  options: LocalOption[];
  setOptions: Dispatch<SetStateAction<LocalOption[]>>;
  uploadingOptionId: string | null;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onOptionChange: (id: string, value: string) => void;
  onUploadOptionMedia: (id: string, file: File | null) => void;
  validationErrors: ValidationErrors;
  setValidationErrors: Dispatch<SetStateAction<ValidationErrors>>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Poll Options *</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddOption}
          disabled={options.length >= 5}
          aria-label="Add poll option"
          className="gap-1">
          <Plus className="h-4 w-4" />
          Add option
        </Button>
      </div>

      <div className="space-y-3">
        {options.map((opt, index) => (
          <div
            key={opt.id}
            className="flex flex-col gap-2 rounded-lg border border-border p-4 bg-card hover:border-primary/50 transition-colors md:flex-row md:items-start">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <Input
                  value={opt.text}
                  onChange={(e) => {
                    onOptionChange(opt.id, e.target.value);
                    if (validationErrors.options) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        options: undefined,
                      }));
                    }
                  }}
                  placeholder={`Enter option ${index + 1}`}
                  maxLength={200}
                  aria-label={`Poll option ${index + 1}`}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2 pl-8">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) =>
                      onUploadOptionMedia(opt.id, e.target.files?.[0] || null)
                    }
                    disabled={uploadingOptionId === opt.id}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingOptionId === opt.id}
                    asChild>
                    <span className="text-xs">
                      {uploadingOptionId === opt.id ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <ImageIcon className="mr-1 h-3 w-3" />
                      )}
                      {opt.media ? "Change" : "Add media"}
                    </span>
                  </Button>
                </label>

                {opt.media && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{opt.media.type === "video" ? "Video" : "Image"}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setOptions((prev) =>
                          prev.map((o) =>
                            o.id === opt.id ? { ...o, media: undefined } : o
                          )
                        )
                      }
                      className="h-5 w-5 p-0"
                      aria-label={`Remove media from option ${index + 1}`}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end md:w-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveOption(opt.id)}
                disabled={options.length <= 2}
                aria-label={`Remove option ${index + 1}`}
                className="text-destructive hover:text-destructive">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {validationErrors.options ? (
        <p className="text-xs text-red-500" role="alert">
          {validationErrors.options}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Provide between 2 and 5 unique options. Each option can have optional media.
        </p>
      )}
    </div>
  );
}
