import { Image as ImageIcon, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StoryCoverSection({
  coverImage,
  uploadingCover,
  onUploadCover,
  onRemoveCover,
  onInsertInlineImage,
}: {
  coverImage: string | undefined;
  uploadingCover: boolean;
  onUploadCover: (file: File | null) => void;
  onRemoveCover: () => void;
  onInsertInlineImage: (file: File | null) => void;
}) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          uploadingCover
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith("image/")) {
            onUploadCover(file);
          }
        }}>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUploadCover(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center gap-2">
            {uploadingCover ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Uploading cover image...
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {coverImage ? "Change Cover Image" : "Add Cover Image"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop or click to upload
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      <label className="inline-flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onInsertInlineImage(e.target.files?.[0] || null)}
        />
        <Button type="button" variant="outline" size="sm">
          <ImageIcon className="h-4 w-4 mr-2" />
          Insert Inline Image
        </Button>
      </label>

      {coverImage && (
        <div className="relative overflow-hidden rounded-lg">
          <img src={coverImage} alt="cover" className="w-full max-h-80 object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onRemoveCover}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
