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
          "relative border border-dashed rounded-[2rem] px-6 py-10 text-center transition-all duration-300",
          uploadingCover
            ? "border-[#2563eb] bg-[#2563eb]/5"
            : "border-white/10 bg-white/[0.01] hover:border-[#2563eb]/50"
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
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUploadCover(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center gap-3">
            {uploadingCover ? (
              <>
                <div className="h-10 w-10 rounded-2xl bg-[#2563eb]/10 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-[#2563eb]" />
                </div>
                <p className="text-sm font-semibold text-[#64748b]">
                  Uploading cover image...
                </p>
              </>
            ) : (
              <>
                <div className="h-10 w-10 rounded-2xl bg-[#2563eb]/10 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-[#2563eb]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {coverImage ? "Change Cover Image" : "Add a Cover Image"}
                  </p>
                  <p className="text-[11px] font-medium text-[#64748b] mt-1">
                    Drag & drop or click to upload (1200×500px)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold px-6">
                  Upload
                </Button>
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
