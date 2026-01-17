import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad2 = (n: number) => String(n).padStart(2, "0");

  if (hrs > 0) return `${hrs}:${pad2(mins)}:${pad2(secs)}`;
  return `${mins}:${pad2(secs)}`;
}

function VideoPlayer({
  src,
  autoPlay,
  containerClassName,
  videoClassName,
}: {
  src: string;
  autoPlay?: boolean;
  containerClassName?: string;
  videoClassName?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    if (!isPlaying || settingsOpen) return;
    hideTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2200);
  }, [clearHideTimer, isPlaying, settingsOpen]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        return;
      }
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    showControls();
  }, [showControls]);

  const changeVolume = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;
      const v = Math.max(0, Math.min(1, value));
      video.volume = v;
      setVolume(v);
      if (v > 0 && video.muted) {
        video.muted = false;
        setIsMuted(false);
      }
      showControls();
    },
    [showControls]
  );

  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(duration) || duration <= 0) return;
      const nextTime = Math.max(0, Math.min(duration, time));
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration]
  );

  const setSpeed = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = rate;
      setPlaybackRate(rate);
      showControls();
    },
    [showControls]
  );

  const togglePiP = useCallback(async () => {
    const video = videoRef.current as (HTMLVideoElement & {
      requestPictureInPicture?: () => Promise<unknown>;
    }) | null;
    if (!video) return;

    try {
      const doc = document as unknown as {
        pictureInPictureEnabled?: boolean;
        pictureInPictureElement?: Element | null;
        exitPictureInPicture?: () => Promise<void>;
      };

      if (!doc.pictureInPictureEnabled || !video.requestPictureInPicture) {
        return;
      }

      if (doc.pictureInPictureElement) {
        await doc.exitPictureInPicture?.();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      return;
    } finally {
      showControls();
    }
  }, [showControls]);

  const downloadVideo = useCallback(() => {
    try {
      const a = document.createElement("a");
      a.href = src;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      return;
    }
  }, [src]);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      return;
    }
    showControls();
  }, [showControls]);

  useEffect(() => {
    const onFsChange = () => {
      const el = containerRef.current;
      setIsFullscreen(Boolean(el && document.fullscreenElement === el));
    };

    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      setIsReady(true);
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      setIsMuted(video.muted);
      setVolume(video.volume);
      setPlaybackRate(video.playbackRate || 1);
      setIsPlaying(!video.paused);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(video.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      scheduleHide();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setControlsVisible(true);
      clearHideTimer();
    };

    const handleVolume = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };

    const handleDuration = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("durationchange", handleDuration);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolume);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("durationchange", handleDuration);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolume);
    };
  }, [clearHideTimer, isSeeking, scheduleHide]);

  useEffect(() => {
    if (!settingsOpen) return;

    const onDocPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (settingsRef.current && settingsRef.current.contains(target)) return;
      setSettingsOpen(false);
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
    };
  }, [settingsOpen]);

  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  const effectiveTime = isSeeking ? seekValue : currentTime;
  const progressPct = duration > 0 ? (effectiveTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black/90 overflow-hidden",
        containerClassName
      )}
      onMouseMove={showControls}
      onPointerDown={showControls}
      onMouseEnter={() => setControlsVisible(true)}
      onMouseLeave={() => {
        if (isPlaying && !settingsOpen) {
          setControlsVisible(false);
        }
      }}>
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        playsInline
        className={cn("w-full h-full", videoClassName)}
        onClick={() => {
          void togglePlay();
          showControls();
        }}
      />

      {!isPlaying && (
        <button
          type="button"
          aria-label="Play"
          onClick={() => {
            void togglePlay();
            showControls();
          }}
          className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center h-16 w-16 rounded-full bg-primary shadow-lg shadow-primary/20">
            <Play className="h-7 w-7 text-primary-foreground ml-0.5" />
          </span>
        </button>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 transition-opacity",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}>
        <div className="px-3 pb-3 pt-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={effectiveTime}
            disabled={!isReady || duration <= 0}
            onPointerDown={() => {
              setIsSeeking(true);
              setSeekValue(currentTime);
            }}
            onChange={(e) => {
              setSeekValue(Number(e.target.value));
            }}
            onPointerUp={() => {
              setIsSeeking(false);
              seekTo(seekValue);
              showControls();
            }}
            className="w-full h-2 appearance-none bg-white/10 rounded-full outline-none"
            style={{
              background: `linear-gradient(to right, rgba(37,99,235,0.95) 0%, rgba(37,99,235,0.95) ${progressPct}%, rgba(255,255,255,0.15) ${progressPct}%, rgba(255,255,255,0.15) 100%)`,
            }}
          />

          <div className="mt-2 flex items-center justify-between text-white/90">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={() => {
                  void togglePlay();
                  showControls();
                }}
                className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-white" />
                ) : (
                  <Play className="h-4 w-4 text-white ml-0.5" />
                )}
              </button>

              <button
                type="button"
                aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                onClick={toggleMute}
                className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-white" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-24 h-2 appearance-none bg-white/10 rounded-full outline-none hidden sm:block"
              />

              <span className="text-xs tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div ref={settingsRef} className="relative">
                <button
                  type="button"
                  aria-label="Settings"
                  onClick={() => {
                    setSettingsOpen((v) => !v);
                    showControls();
                  }}
                  className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </button>

                {settingsOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 rounded-xl bg-[#0f121a]/95 border border-white/10 shadow-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        downloadVideo();
                        setSettingsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-white/90 hover:bg-white/5 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </button>

                    <div className="px-3 py-2 text-xs text-white/60 border-t border-white/10">
                      Playback speed
                    </div>
                    {([0.5, 0.75, 1, 1.25, 1.5, 2] as const).map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setSpeed(rate)}
                        className="w-full px-3 py-2 text-sm text-white/90 hover:bg-white/5 flex items-center justify-between">
                        <span>{rate === 1 ? "Normal" : `${rate}x`}</span>
                        {Math.abs(playbackRate - rate) < 0.001 && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        void togglePiP();
                        setSettingsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-white/90 hover:bg-white/5 flex items-center justify-between border-t border-white/10">
                      <span>Picture in picture</span>
                      <span className="text-xs text-white/60">PiP</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={() => void toggleFullscreen()}
                className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
                {isFullscreen ? (
                  <Minimize className="h-4 w-4 text-white" />
                ) : (
                  <Maximize className="h-4 w-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
            <VideoPlayer
              src={item.url}
              autoPlay={false}
              containerClassName="rounded-xl"
              videoClassName="rounded-xl"
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
              <VideoPlayer
                src={currentItem?.url}
                autoPlay
                containerClassName="max-w-full max-h-full"
                videoClassName="max-w-full max-h-full object-contain"
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
