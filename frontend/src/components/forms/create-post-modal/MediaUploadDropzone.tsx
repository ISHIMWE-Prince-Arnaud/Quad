import type { DragEventHandler } from "react";

import { Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function MediaUploadDropzone({
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onSelectFiles,
}: {
  isDragging: boolean;
  onDrop: DragEventHandler<HTMLDivElement>;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDragLeave: DragEventHandler<HTMLDivElement>;
  onSelectFiles: (files: FileList | null) => void;
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = "image/*,video/*";
        input.onchange = (e) => onSelectFiles((e.target as HTMLInputElement).files);
        input.click();
      }}>
      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium mb-1">Add photos or videos</p>
      <p className="text-xs text-muted-foreground">or drag and drop</p>
    </div>
  );
}
