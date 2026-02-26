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
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      value || defaultValue || "",
    );
    const [isFocused, setIsFocused] = React.useState(false);
    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = String(currentValue).length > 0;

    const characterCount =
      typeof currentValue === "string" ? currentValue.length : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      props.onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="flex flex-col gap-1.5 w-full group">
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-14 w-full rounded-2xl border border-input bg-background/50 px-4 py-4 pt-6 text-sm ring-offset-background transition-all placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:text-muted-foreground/50 focus-visible:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
              "focus:ring-[6px] focus:ring-primary/10",
              rightElement && "pr-12",
              error &&
                "border-destructive focus:ring-destructive/10 focus:border-destructive",
              className,
            )}
            ref={ref}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "input-error" : undefined}
            {...props}
          />

          {label && (
            <label
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none select-none",
                isFocused || hasValue
                  ? "top-2 text-[10px] font-bold uppercase tracking-wider text-primary"
                  : "top-4 text-sm text-muted-foreground",
                error && (isFocused || hasValue) && "text-destructive",
              )}>
              {label}
            </label>
          )}

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity group-focus-within:opacity-100">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <div
            id="input-error"
            className="flex items-center gap-1.5 text-[11px] font-medium text-destructive px-1 translate-y-[-2px] animate-slide-in-from-top">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        ) : showCharacterCount && maxLength ? (
          <div className="text-[10px] text-muted-foreground text-right px-1">
            {characterCount} / {maxLength}
          </div>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
