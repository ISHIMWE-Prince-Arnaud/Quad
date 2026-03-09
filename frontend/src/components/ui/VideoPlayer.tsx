import { useCallback, useEffect, useRef, useState } from "react";
import {
  PiCheckBold,
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

export function VideoPlayer({
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
        "relative bg-muted/30 overflow-hidden w-full h-full backdrop-blur-sm",
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/35 pointer-events-none backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2 text-foreground/80">
            {!hasError ? (
              <>
                <PiSpinnerBold className="h-7 w-7 animate-spin text-primary" />
                <div className="text-sm font-medium">
                  {isSlowNetwork ? "Buffering…" : "Loading…"}
                </div>
                {isSlowNetwork && (
                  <div className="text-xs text-muted-foreground">
                    Network seems slow or unstable
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-sm font-medium">Failed to load video</div>
                <div className="text-xs text-muted-foreground">
                  Tap play to retry
                </div>
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
          className="absolute inset-0 flex items-center justify-center group">
          <span className="flex items-center justify-center h-16 w-16 rounded-full bg-primary shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-110">
            <PiPlayBold className="h-7 w-7 text-primary-foreground ml-0.5" />
          </span>
        </button>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}>
        <div className="px-3 pb-3 pt-2 bg-gradient-to-t from-background/90 via-background/40 to-transparent backdrop-blur-[2px]">
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
            className="w-full h-1.5 appearance-none bg-foreground/10 rounded-full outline-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progressPct}%, hsl(var(--foreground) / 0.1) ${progressPct}%, hsl(var(--foreground) / 0.1) 100%)`,
            }}
          />

          <div className="mt-2 flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={() => {
                  void togglePlay();
                  showControls();
                }}
                className="h-9 w-9 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/40 flex items-center justify-center transition-colors">
                {isPlaying ? (
                  <PiPauseBold className="h-4 w-4" />
                ) : (
                  <PiPlayBold className="h-4 w-4 ml-0.5" />
                )}
              </button>

              <button
                type="button"
                aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                onClick={toggleMute}
                className="h-9 w-9 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/40 flex items-center justify-center transition-colors">
                {isMuted || volume === 0 ? (
                  <PiSpeakerSlashBold className="h-4 w-4" />
                ) : (
                  <PiSpeakerHighBold className="h-4 w-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-20 h-1.5 appearance-none bg-foreground/10 rounded-full outline-none hidden sm:block accent-primary cursor-pointer"
              />

              <span className="text-xs tabular-nums font-medium text-muted-foreground">
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
                  className="h-9 w-9 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/40 flex items-center justify-center transition-colors">
                  <PiGearBold className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 rounded-xl bg-popover border border-border shadow-2xl overflow-hidden backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => {
                        downloadVideo();
                        setSettingsOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-sm hover:bg-accent flex items-center gap-2 transition-colors">
                      <PiDownloadSimpleBold className="h-4 w-4" />
                      Download
                    </button>

                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground border-t border-border/40 bg-muted/30">
                      Playback speed
                    </div>
                    {([0.5, 0.75, 1, 1.25, 1.5, 2] as const).map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setSpeed(rate)}
                        className="w-full px-3 py-2 text-sm hover:bg-accent flex items-center justify-between transition-colors">
                        <span
                          className={cn(
                            Math.abs(playbackRate - rate) < 0.001 &&
                              "font-bold text-primary",
                          )}>
                          {rate === 1 ? "Normal" : `${rate}x`}
                        </span>
                        {Math.abs(playbackRate - rate) < 0.001 && (
                          <PiCheckBold className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        void togglePiP();
                        setSettingsOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-sm hover:bg-accent flex items-center justify-between border-t border-border/40 transition-colors">
                      <span>Picture in picture</span>
                      <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        PiP
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={() => void toggleFullscreen()}
                className="h-9 w-9 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/40 flex items-center justify-center transition-colors">
                {isFullscreen ? (
                  <PiCornersInBold className="h-4 w-4" />
                ) : (
                  <PiCornersOutBold className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
