import type { ChangeEvent, RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Trash2 } from "lucide-react";

export function CoverImageSection({
  src,
  processing,
  inputRef,
  onChange,
  onRemove,
}: {
  src: string | null;
  processing: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="space-y-4">
      <Label>Cover Image</Label>
      <div className="relative">
        <div
          className="relative h-32 sm:h-40 rounded-lg overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 55%, #2563eb 100%), radial-gradient(circle at 18px 18px, transparent 0 14px, rgba(255,255,255,0.14) 14px 15px, transparent 15px 36px)",
            backgroundSize: "cover, 36px 36px",
            backgroundPosition: "center, 0 0",
          }}>
          {src && (
            <img
              src={src}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={processing}
              className="bg-black/20 hover:bg-black/30 text-white border-white/20 backdrop-blur-sm">
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Change Cover
                </>
              )}
            </Button>
            {onRemove && src && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onRemove}
                disabled={processing}
                className="bg-black/20 hover:bg-black/30 text-white border-white/20 backdrop-blur-sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground mt-2">
          Recommended size: 1200×400px. Max file size: 10MB.
        </p>
      </div>
    </div>
  );
}
