import { useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    if (uploadingCover) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUploadCover(e.target.files?.[0] || null)}
      />

      {!coverImage && (
        <div
          className={cn(
            "relative border border-dashed rounded-[2rem] px-6 py-10 text-center transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40",
            uploadingCover
              ? "border-[#2563eb] bg-[#2563eb]/5"
              : "border-white/10 bg-white/[0.01] hover:border-[#2563eb]/50"
          )}
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
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
                    Add a Cover Image
                  </p>
                  <p className="text-[11px] font-medium text-[#64748b] mt-1">
                    Drag & drop or click to upload (1200×500px)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {coverImage && (
        <div
          className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.01]"
          tabIndex={0}>
          <img
            src={coverImage}
            alt="cover"
            className="w-full max-h-80 object-cover"
          />

          <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />

          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-white/10 bg-white/10 hover:bg-white/15 text-white font-semibold px-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openFilePicker();
              }}>
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 rounded-full px-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveCover();
              }}>
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
