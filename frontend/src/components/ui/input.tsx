import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  showCharacterCount?: boolean;
  rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      label,
      showCharacterCount = false,
      rightElement,
      maxLength,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      value || defaultValue || "",
    );
    const currentValue = value !== undefined ? value : internalValue;
    const characterCount =
      typeof currentValue === "string" ? currentValue.length : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-medium text-foreground">{label}</label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
              rightElement && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            ref={ref}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "input-error" : undefined}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <div
            id="input-error"
            className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {showCharacterCount && maxLength && (
          <div className="text-xs text-muted-foreground text-right">
            {characterCount} / {maxLength}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
