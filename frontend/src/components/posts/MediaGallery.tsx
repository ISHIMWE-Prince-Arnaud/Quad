import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaItem {
  url: string;
  type: "image" | "video";
  aspectRatio?: "1:1" | "16:9" | "9:16";
}

interface MediaGalleryProps {
  media: MediaItem[];
  className?: string;
}

export function MediaGallery({ media, className }: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  // Single media item
  if (media.length === 1) {
    const item = media[0];
    return (
      <>
        <div className={cn("relative rounded-xl overflow-hidden", className)}>
          {item.type === "image" ? (
            <img
              src={item.url}
              alt="Post media"
              className="w-full max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition-all duration-200"
              onClick={() => openLightbox(0)}
            />
          ) : (
            <video
              src={item.url}
              controls
              className="w-full max-h-[500px] object-cover rounded-xl"
            />
          )}
        </div>
        <MediaLightbox
          media={media}
          currentIndex={currentIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </>
    );
  }

  // Two media items - side by side
  if (media.length === 2) {
    return (
      <>
        <div
          className={cn(
            "grid grid-cols-2 gap-2 rounded-xl overflow-hidden",
            className
          )}>
          {media.map((item, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-all duration-200"
                  onClick={() => openLightbox(index)}
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                />
              )}
            </div>
          ))}
        </div>
        <MediaLightbox
          media={media}
          currentIndex={currentIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </>
    );
  }

  // Three media items - 2 top, 1 bottom
  if (media.length === 3) {
    return (
      <>
        <div
          className={cn(
            "grid grid-cols-2 gap-2 rounded-xl overflow-hidden",
            className
          )}>
          {media.slice(0, 2).map((item, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-all duration-200"
                  onClick={() => openLightbox(index)}
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                />
              )}
            </div>
          ))}
          <div className="relative aspect-video col-span-2 rounded-lg overflow-hidden">
            {media[2].type === "image" ? (
              <img
                src={media[2].url}
                alt="Post media 3"
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-all duration-200"
                onClick={() => openLightbox(2)}
              />
            ) : (
              <video
                src={media[2].url}
                className="w-full h-full object-cover"
                controls
              />
            )}
          </div>
        </div>
        <MediaLightbox
          media={media}
          currentIndex={currentIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </>
    );
  }

  // Four or more items - 2x2 grid with "+N more" overlay
  const displayItems = media.slice(0, 4);
  const remaining = media.length - 4;

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 gap-2 rounded-xl overflow-hidden",
          className
        )}>
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden">
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={`Post media ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-all duration-200"
                onClick={() => openLightbox(index)}
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                controls
              />
            )}
            {index === 3 && remaining > 0 && (
              <div
                className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-black/70"
                onClick={() => openLightbox(index)}>
                <span className="text-white text-3xl font-bold">
                  +{remaining}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <MediaLightbox
        media={media}
        currentIndex={currentIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </>
  );
}

// Lightbox component for full-screen media viewing
interface MediaLightboxProps {
  media: MediaItem[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function MediaLightbox({
  media,
  currentIndex,
  open,
  onClose,
  onNext,
  onPrev,
}: MediaLightboxProps) {
  const currentItem = media[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-black/95">
        <DialogTitle className="sr-only">Media viewer</DialogTitle>
        <DialogDescription className="sr-only">
          View post media in full screen and navigate between items.
        </DialogDescription>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20"
                onClick={onPrev}>
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20"
                onClick={onNext}>
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Media content */}
          <div className="w-full h-full flex items-center justify-center p-8">
            {currentItem?.type === "image" ? (
              <img
                src={currentItem.url}
                alt="Full size"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={currentItem?.url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Counter */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {media.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
