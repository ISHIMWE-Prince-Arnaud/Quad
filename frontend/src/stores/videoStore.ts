import { create } from "zustand";
import { persist } from "zustand/middleware";

interface VideoState {
  autoPlay: boolean;
  autoReplay: boolean;
  setAutoPlay: (value: boolean) => void;
  setAutoReplay: (value: boolean) => void;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set) => ({
      autoPlay: true,
      autoReplay: true,
      setAutoPlay: (value) => set({ autoPlay: value }),
      setAutoReplay: (value) => set({ autoReplay: value }),
    }),
    {
      name: "quad-video-settings",
    }
  )
);
