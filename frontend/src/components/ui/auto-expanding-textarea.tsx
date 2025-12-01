import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutoExpandingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

const AutoExpandingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoExpandingTextareaProps
>(({ className, minHeight = 80, maxHeight = 400, onChange, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to recalculate
    textarea.style.height = `${minHeight}px`;

    // Calculate new height based on scroll height
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);

  React.useEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    onChange?.(e);
  };

  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto transition-all",
        className
      )}
      ref={(node) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      onChange={handleChange}
      style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
      {...props}
    />
  );
});

AutoExpandingTextarea.displayName = "AutoExpandingTextarea";

export { AutoExpandingTextarea };
