import { useCallback, useState } from "react";
import type { DragEvent } from "react";
import toast from "react-hot-toast";

import { UploadService } from "@/services/uploadService";
import type { MediaData } from "@/schemas/post.schema";
import { logError } from "@/lib/errorHandling";

import type { UploadingFile } from "./types";

export function useCreatePostMedia() {
  const [uploadedMedia, setUploadedMedia] = useState<MediaData[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const resetMediaState = useCallback(() => {
    // Best-effort cleanup for preview URLs still tracked in state
    for (const file of uploadingFiles) {
      if (file.preview) URL.revokeObjectURL(file.preview);
    }
    setUploadedMedia([]);
    setUploadingFiles([]);
    setIsDragging(false);
  }, [uploadingFiles]);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const totalFiles = uploadedMedia.length + uploadingFiles.length + fileArray.length;

      if (totalFiles > 10) {
        toast.error("You can only upload up to 10 files");
        return;
      }

      const validFiles: File[] = [];
      for (const file of fileArray) {
        const validation = UploadService.validateFile(file, "any");
        if (!validation.valid) {
          toast.error(validation.error || "Invalid file");
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
      }));

      const baseIndex = uploadingFiles.length;
      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const uploadingIndex = baseIndex + i;
        const localPreview = newUploadingFiles[i]?.preview;

        try {
          setUploadingFiles((prev) =>
            prev.map((uf, idx) => (idx === uploadingIndex ? { ...uf, progress: 50 } : uf))
          );

          const uploadResult = await UploadService.uploadPostMedia(file);

          let aspectRatio: "1:1" | "16:9" | "9:16" | undefined;
          if (file.type.startsWith("image/") && localPreview) {
            const img = new Image();
            img.src = localPreview;
            await new Promise((resolve) => {
              img.onload = () => {
                const ratio = img.width / img.height;
                if (Math.abs(ratio - 1) < 0.1) aspectRatio = "1:1";
                else if (Math.abs(ratio - 16 / 9) < 0.2) aspectRatio = "16:9";
                else if (Math.abs(ratio - 9 / 16) < 0.2) aspectRatio = "9:16";
                else aspectRatio = "1:1";
                resolve(null);
              };
            });
          }

          const newMedia: MediaData = {
            url: uploadResult.url,
            type: file.type.startsWith("video/") ? "video" : "image",
            aspectRatio,
          };

          setUploadedMedia((prev) => [...prev, newMedia]);
          setUploadingFiles((prev) => prev.filter((_, idx) => idx !== uploadingIndex));

          if (localPreview) URL.revokeObjectURL(localPreview);
          toast.success("Media uploaded successfully");
        } catch (error) {
          logError(error, {
            component: "useCreatePostMedia",
            action: "uploadPostMedia",
            metadata: { fileType: file.type, fileName: file.name },
          });
          setUploadingFiles((prev) =>
            prev.map((uf, idx) => (idx === uploadingIndex ? { ...uf, error: "Upload failed" } : uf))
          );
          toast.error("Failed to upload media");
        }
      }
    },
    [uploadedMedia.length, uploadingFiles.length]
  );

  const removeMedia = useCallback((index: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeUploadingFile = useCallback((index: number) => {
    setUploadingFiles((prev) => {
      const file = prev[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      void handleFileSelect(e.dataTransfer?.files || null);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    uploadedMedia,
    uploadingFiles,
    isDragging,
    setIsDragging,
    setUploadedMedia,
    setUploadingFiles,
    resetMediaState,
    handleFileSelect,
    removeMedia,
    removeUploadingFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
}
