import * as React from "react";
import { PiWarningCircleBold } from "react-icons/pi";
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
              "flex h-11 w-full rounded-full border border-input bg-background/50 px-5 py-3 pt-5 text-sm font-medium ring-offset-background transition-all placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:text-muted-foreground/50 focus-visible:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
              "focus:ring-[6px] focus:ring-primary/10 focus:shadow-[0_0_20px_-5px_hsla(var(--primary)/0.15)]",
              rightElement && "pr-12",
              error &&
                "border-destructive focus:ring-destructive/10 focus:border-destructive focus:shadow-none",
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
                "absolute left-5 transition-all duration-200 pointer-events-none select-none",
                isFocused || hasValue
                  ? "top-1 text-[8px] font-black uppercase tracking-[0.1em] text-primary"
                  : "top-3 text-[13px] text-muted-foreground font-medium",
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
            <PiWarningCircleBold className="h-3 w-3" />
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
