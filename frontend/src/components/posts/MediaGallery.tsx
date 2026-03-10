import { useState } from "react";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { MediaLightbox, type MediaItem } from "@/components/ui/MediaLightbox";

function getAspectClass(aspectRatio?: MediaItem["aspectRatio"]) {
  if (aspectRatio === "1:1") return "aspect-square";
  if (aspectRatio === "9:16") return "aspect-[9/16]";
  return "aspect-video";
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
        <div
          className={cn(
            "relative rounded-xl overflow-hidden",
            item.type === "video" &&
              cn(
                "bg-zinc-100 dark:bg-black",
                getAspectClass(item.aspectRatio),
                "max-h-[500px]",
              ),
            className,
          )}>
          {item.type === "image" ? (
            <img
              src={item.url}
              alt="Post media"
              className="w-full max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition-all duration-200"
              onClick={() => openLightbox(0)}
            />
          ) : (
            <VideoPlayer
              src={item.url}
              autoPlay={false}
              containerClassName="rounded-xl"
              videoClassName="rounded-xl object-contain"
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
            className,
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
                <VideoPlayer
                  src={item.url}
                  autoPlay={false}
                  containerClassName="rounded-lg"
                  videoClassName="rounded-lg"
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
            className,
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
                <VideoPlayer
                  src={item.url}
                  autoPlay={false}
                  containerClassName="rounded-lg"
                  videoClassName="rounded-lg"
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
              <VideoPlayer
                src={media[2].url}
                autoPlay={false}
                containerClassName="rounded-lg"
                videoClassName="rounded-lg"
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
          className,
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
              <VideoPlayer
                src={item.url}
                autoPlay={false}
                containerClassName="rounded-lg"
                videoClassName="rounded-lg"
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
