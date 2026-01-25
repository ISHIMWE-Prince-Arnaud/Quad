import type { PollMedia } from "@/types/poll";

export function mapFileToMedia(file: File, url: string): PollMedia {
  void file;
  return { url, type: "image" };
}
