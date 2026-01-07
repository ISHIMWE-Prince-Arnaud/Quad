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
          <FormControl>
            <AutoExpandingTextarea
              placeholder="What's happening?"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              minHeight={120}
              maxHeight={400}
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <div className="flex items-center justify-between text-xs">
            <FormMessage />
            <span
              className={cn(
                "text-muted-foreground",
                isOverLimit && "text-destructive font-medium"
              )}>
              {charCount}/1000
            </span>
          </div>
        </FormItem>
      )}
    />
  );
}
