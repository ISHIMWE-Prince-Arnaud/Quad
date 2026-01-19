import type { Control } from "react-hook-form";

import { AutoExpandingTextarea } from "@/components/ui/auto-expanding-textarea";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { CreatePostData } from "@/schemas/post.schema";

export function CreatePostTextField({
  control,
  isLoading,
  charCount,
  isOverLimit,
}: {
  control: Control<CreatePostData>;
  isLoading: boolean;
  charCount: number;
  isOverLimit: boolean;
}) {
  return (
    <FormField
      control={control}
      name="text"
      render={({ field }) => (
        <FormItem>
          <p className="text-sm font-semibold text-white">What's happening?</p>
          <FormControl>
            <div className="relative rounded-2xl border border-white/5 bg-[#0f172a]/50">
              <AutoExpandingTextarea
                placeholder="Share your thoughts..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-white/90 placeholder:text-[#64748b] px-4 py-3 pr-24"
                minHeight={120}
                maxHeight={320}
                disabled={isLoading}
                {...field}
              />
              <span
                className={cn(
                  "absolute bottom-2 right-3 text-xs text-[#94a3b8]",
                  isOverLimit && "text-destructive font-medium"
                )}>
                {charCount}/1000
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
