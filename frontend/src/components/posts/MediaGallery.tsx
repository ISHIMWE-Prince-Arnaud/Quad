import { useCallback, useEffect, useRef, useState } from "react";
import {
  PiCheckBold,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiDownloadSimpleBold,
  PiSpinnerBold,
  PiCornersOutBold,
  PiCornersInBold,
  PiPauseBold,
  PiPlayBold,
  PiGearBold,
  PiSpeakerHighBold,
  PiSpeakerSlashBold,
} from "react-icons/pi";
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

const GLOBAL_VIDEO_PLAY_EVENT = "quad:video-play";
let globalVideoPlayerInstance = 0;

function getAspectClass(aspectRatio?: MediaItem["aspectRatio"]) {
  if (aspectRatio === "1:1") return "aspect-square";
  if (aspectRatio === "9:16") return "aspect-[9/16]";
  return "aspect-video";
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
  const playerIdRef = useRef<string>(
    `vp_${Date.now()}_${(globalVideoPlayerInstance += 1)}`,
  );
  const bufferingTimerRef = useRef<number | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [hasError, setHasError] = useState(false);
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

  const clearBufferingTimer = useCallback(() => {
    if (bufferingTimerRef.current) {
      window.clearTimeout(bufferingTimerRef.current);
      bufferingTimerRef.current = null;
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
    [showControls],
  );

  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(duration) || duration <= 0) return;
      const nextTime = Math.max(0, Math.min(duration, time));
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration],
  );

  const setSpeed = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = rate;
      setPlaybackRate(rate);
      showControls();
    },
    [showControls],
  );

  const togglePiP = useCallback(async () => {
    const video = videoRef.current as
      | (HTMLVideoElement & {
          requestPictureInPicture?: () => Promise<unknown>;
        })
      | null;
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
      setIsInitialLoading(false);
      setHasError(false);
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      setIsMuted(video.muted);
      setVolume(video.volume);
      setPlaybackRate(video.playbackRate || 1);
      setIsPlaying(!video.paused);
    };

    const handleLoadStart = () => {
      setIsInitialLoading(true);
      setHasError(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      setIsInitialLoading(false);
    };

    const handleStalled = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsInitialLoading(false);
      setIsBuffering(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsInitialLoading(false);
      setIsBuffering(false);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(video.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      scheduleHide();

      window.dispatchEvent(
        new CustomEvent(GLOBAL_VIDEO_PLAY_EVENT, {
          detail: { id: playerIdRef.current },
        }),
      );
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
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.addEventListener("durationchange", handleDuration);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolume);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("stalled", handleStalled);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.removeEventListener("durationchange", handleDuration);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolume);
    };
  }, [clearHideTimer, isSeeking, scheduleHide]);

  useEffect(() => {
    clearBufferingTimer();
    setIsSlowNetwork(false);

    if (hasError) return;

    if (isInitialLoading || isBuffering) {
      bufferingTimerRef.current = window.setTimeout(() => {
        setIsSlowNetwork(true);
      }, 2500);
    }

    return () => {
      clearBufferingTimer();
    };
  }, [clearBufferingTimer, hasError, isBuffering, isInitialLoading]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onGlobalPlay = (event: Event) => {
      const ev = event as CustomEvent<{ id?: string }>;
      if (!ev.detail?.id) return;
      if (ev.detail.id === playerIdRef.current) return;
      if (!video.paused) {
        video.pause();
      }
    };

    window.addEventListener(GLOBAL_VIDEO_PLAY_EVENT, onGlobalPlay);
    return () => {
      window.removeEventListener(GLOBAL_VIDEO_PLAY_EVENT, onGlobalPlay);
    };
  }, []);

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
      clearBufferingTimer();
    };
  }, [clearBufferingTimer, clearHideTimer]);

  const effectiveTime = isSeeking ? seekValue : currentTime;
  const progressPct = duration > 0 ? (effectiveTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black/90 overflow-hidden w-full h-full",
        containerClassName,
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
        className={cn("w-full h-full object-cover", videoClassName)}
        onClick={() => {
          void togglePlay();
          showControls();
        }}
      />

      {(isInitialLoading || isBuffering || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-white/90">
            {!hasError ? (
              <>
                <PiSpinnerBold className="h-7 w-7 animate-spin" />
                <div className="text-sm font-medium">
                  {isSlowNetwork ? "Buffering…" : "Loading…"}
                </div>
                {isSlowNetwork && (
                  <div className="text-xs text-white/70">
                    Network seems slow or unstable
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-sm font-medium">Failed to load video</div>
                <div className="text-xs text-white/70">Tap play to retry</div>
              </>
            )}
          </div>
        </div>
      )}

      {!isPlaying && isReady && !isInitialLoading && !hasError && (
        <button
          type="button"
          aria-label="Play"
          onClick={() => {
            void togglePlay();
            showControls();
          }}
          className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center h-16 w-16 rounded-full bg-primary shadow-lg shadow-primary/20">
            <PiPlayBold className="h-7 w-7 text-primary-foreground ml-0.5" />
          </span>
        </button>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 transition-opacity",
          controlsVisible ? "opacity-100" : "opacity-0",
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
                  <PiPauseBold className="h-4 w-4 text-white" />
                ) : (
                  <PiPlayBold className="h-4 w-4 text-white ml-0.5" />
                )}
              </button>

              <button
                type="button"
                aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                onClick={toggleMute}
                className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
                {isMuted || volume === 0 ? (
                  <PiSpeakerSlashBold className="h-4 w-4 text-white" />
                ) : (
                  <PiSpeakerHighBold className="h-4 w-4 text-white" />
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
                  <PiGearBold className="h-4 w-4 text-white" />
                </button>

                {settingsOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 rounded-xl bg-popover/95 border border-border shadow-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        downloadVideo();
                        setSettingsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-white/90 hover:bg-white/5 flex items-center gap-2">
                      <PiDownloadSimpleBold className="h-4 w-4" />
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
                          <PiCheckBold className="h-4 w-4" />
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
                  <PiCornersInBold className="h-4 w-4 text-white" />
                ) : (
                  <PiCornersOutBold className="h-4 w-4 text-white" />
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
        <div
          className={cn(
            "relative rounded-xl overflow-hidden",
            item.type === "video" &&
              cn("bg-black", getAspectClass(item.aspectRatio), "max-h-[500px]"),
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showClose={false}
        className="!left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-screen p-0 bg-black/95 border-0 rounded-none">
        <DialogTitle className="sr-only">Media viewer</DialogTitle>
        <DialogDescription className="sr-only">
          View post media in full screen and navigate between items.
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
          {/* Navigation buttons */}
          {/* Media content */}
          <div
            className="relative z-10 w-full h-full flex items-center justify-center p-8"
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center w-full h-full max-w-[1100px] max-h-[85vh]">
              {media.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 z-50 text-white hover:bg-white/20"
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
                    className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-50 text-white hover:bg-white/20"
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

              {currentItem?.type === "image" ? (
                <img
                  src={currentItem.url}
                  alt="Full size"
                  ref={(node) => {
                    mediaElementRef.current = node;
                  }}
                  className="max-w-[1100px] max-h-[85vh] w-auto h-auto object-contain"
                />
              ) : (
                <div
                  ref={(node) => {
                    mediaElementRef.current = node;
                  }}
                  className="w-full h-full max-w-[1100px] max-h-[85vh]">
                  <VideoPlayer
                    src={currentItem?.url}
                    autoPlay
                    containerClassName="w-full h-full"
                    videoClassName="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
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
