import type { ChangeEvent, RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PiCameraBold,
  PiSpinnerBold,
  PiTrashBold,
  PiUploadSimpleBold,
} from "react-icons/pi";

export function ProfileImageSection({
  src,
  displayInitial,
  processing,
  inputRef,
  onChange,
  onRemove,
}: {
  src: string | null;
  displayInitial: string;
  processing: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
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
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 shadow-lg transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/40">
            {processing ? (
              <PiSpinnerBold className="h-4 w-4 animate-spin" />
            ) : (
              <PiCameraBold className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={processing}
            className="w-full sm:w-auto rounded-xl transition-colors hover:bg-primary/10 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/40">
            <PiUploadSimpleBold className="h-4 w-4 mr-2" />
            {processing ? "Processing..." : "Upload New Photo"}
          </Button>
          {onRemove && src && (
            <Button
              type="button"
              variant="outline"
              onClick={onRemove}
              disabled={processing}
              className="w-full sm:w-auto sm:ml-2 rounded-xl border-destructive/30 text-destructive transition-colors hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive/40">
              <PiTrashBold className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
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
