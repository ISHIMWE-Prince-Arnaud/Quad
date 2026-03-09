import { useEffect, useRef } from "react";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoPlayer } from "./VideoPlayer";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  aspectRatio?: "1:1" | "16:9" | "9:16";
}

export interface MediaLightboxProps {
  media: MediaItem[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MediaLightbox({
  media,
  currentIndex,
  open,
  onClose,
  onNext,
  onPrev,
}: MediaLightboxProps) {
  const currentItem = media[currentIndex];
  const mediaElementRef = useRef<HTMLElement | null>(null);
  const prevButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (media.length <= 1) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [media.length, onNext, onPrev, open]);

  if (!currentItem) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showClose={false}
        className="!left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-screen p-0 bg-background/95 border-0 rounded-none shadow-none z-[999]">
        <DialogTitle className="sr-only">Media viewer</DialogTitle>
        <DialogDescription className="sr-only">
          View media in full screen and navigate between items.
        </DialogDescription>
        <div
          className="relative w-full h-full"
          onPointerDownCapture={(e) => {
            const target = e.target as Node | null;
            if (!target) return;

            const mediaEl = mediaElementRef.current;
            const prevEl = prevButtonRef.current;
            const nextEl = nextButtonRef.current;

            const clickedMedia = !!mediaEl && mediaEl.contains(target);
            const clickedPrev = !!prevEl && prevEl.contains(target);
            const clickedNext = !!nextEl && nextEl.contains(target);

            if (!clickedMedia && !clickedPrev && !clickedNext) onClose();
          }}>
          {/* Media content */}
          <div
            className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8"
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center w-full h-full max-w-[1100px] max-h-[85vh]">
              {media.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full md:-translate-x-1/2 z-50 text-foreground hover:bg-accent/40 h-12 w-12"
                    ref={prevButtonRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}>
                    <PiCaretLeftBold className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full md:translate-x-1/2 z-50 text-foreground hover:bg-accent/40 h-12 w-12"
                    ref={nextButtonRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}>
                    <PiCaretRightBold className="h-8 w-8" />
                  </Button>
                </>
              )}

              {currentItem.type === "image" ? (
                <img
                  src={currentItem.url}
                  alt="Full size"
                  ref={(node) => {
                    mediaElementRef.current = node;
                  }}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain select-none shadow-2xl"
                />
              ) : (
                <div
                  ref={(node) => {
                    mediaElementRef.current = node;
                  }}
                  className="w-full h-full max-w-full max-h-[85vh] shadow-2xl">
                  <VideoPlayer
                    src={currentItem.url}
                    autoPlay
                    containerClassName="w-full h-full rounded-lg overflow-hidden"
                    videoClassName="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Close button for mobile accessibility */}
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-50 text-foreground hover:bg-accent/40 rounded-full h-10 w-10"
            onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>

          {/* Counter */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-foreground bg-accent/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
              {currentIndex + 1} / {media.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
