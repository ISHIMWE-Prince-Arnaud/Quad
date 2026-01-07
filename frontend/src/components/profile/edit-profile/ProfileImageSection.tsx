import type { ChangeEvent, RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";

export function ProfileImageSection({
  src,
  displayInitial,
  processing,
  inputRef,
  onChange,
}: {
  src: string | null;
  displayInitial: string;
  processing: boolean;
  inputRef: RefObject<HTMLInputElement>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <Label>Profile Picture</Label>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarImage src={src || undefined} alt="Profile preview" />
            <AvatarFallback className="text-lg">
              {displayInitial.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={processing}
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 shadow-lg">
            {processing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={processing}
            className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            {processing ? "Processing..." : "Upload New Photo"}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Square image recommended. Max file size: 10MB.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
