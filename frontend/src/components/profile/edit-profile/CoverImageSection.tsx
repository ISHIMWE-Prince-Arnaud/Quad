import type { ChangeEvent, RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

export function CoverImageSection({
  src,
  processing,
  inputRef,
  onChange,
}: {
  src: string | null;
  processing: boolean;
  inputRef: RefObject<HTMLInputElement>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <Label>Cover Image</Label>
      <div className="relative">
        <div className="relative h-32 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
          {src && (
            <img
              src={src}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
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
