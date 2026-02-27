import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type SegmentedOTPProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function SegmentedOTP({ value, onChange, disabled }: SegmentedOTPProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first empty input or the last one if all are filled
    const firstEmptyIndex = value.length < 6 ? value.length : 5;
    inputRefs.current[firstEmptyIndex]?.focus();
  }, [value.length]);

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;

    const newValue = value.split("");
    // Use only the last character if multiple are entered (like paste)
    newValue[index] = val[val.length - 1];
    const joinedValue = newValue.join("").slice(0, 6);
    onChange(joinedValue);

    // Focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Backspace on empty input: go back and clear
        const newValue = value.split("");
        newValue[index - 1] = "";
        onChange(newValue.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          autoComplete="one-time-code"
          className={cn(
            "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-extrabold bg-muted/20 border rounded-xl transition-all duration-300 outline-none shadow-sm",
            "focus:border-primary focus:ring-[6px] focus:ring-primary/20 focus:scale-105 focus:bg-background",
            value[i]
              ? "border-primary text-primary"
              : "border-border/50 text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
}
