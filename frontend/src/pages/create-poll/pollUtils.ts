import type { PollMedia } from "@/types/poll";

export function mapFileToMedia(file: File, url: string): PollMedia {
  const type: PollMedia["type"] = file.type.startsWith("video/")
    ? "video"
    : "image";
  return { url, type };
}
