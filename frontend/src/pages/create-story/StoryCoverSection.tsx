import { Image as ImageIcon, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StoryCoverSection({
  coverImage,
  uploadingCover,
  onUploadCover,
  onRemoveCover,
}: {
  coverImage: string | undefined;
  uploadingCover: boolean;
  onUploadCover: (file: File | null) => void;
  onRemoveCover: () => void;
}) {
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 group",
          uploadingCover
            ? "border-[#2563eb] bg-[#2563eb]/5"
            : "border-white/10 hover:border-[#2563eb]/50 hover:bg-white/[0.02]"
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
          <div className="flex flex-col items-center gap-4">
            {uploadingCover ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-[#2563eb]" />
                <p className="text-sm font-semibold text-[#64748b]">
                  Uploading cover image...
                </p>
              </>
            ) : (
              <>
                <div className="p-4 bg-[#2563eb]/10 rounded-2xl group-hover:bg-[#2563eb]/20 transition-colors">
                  <ImageIcon className="h-8 w-8 text-[#2563eb]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white mb-1">
                    {coverImage ? "Change Cover Image" : "Upload Image"}
                  </p>
                  <p className="text-xs font-medium text-[#64748b]">
                    PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {coverImage && (
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={coverImage}
            alt="cover"
            className="w-full max-h-80 object-cover"
          />
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
