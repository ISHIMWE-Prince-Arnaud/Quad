import { useState, useCallback, useRef } from "react";
import { X, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadService } from "@/services/uploadService";
import type { MediaData } from "@/schemas/post.schema";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  onMediaChange: (media: MediaData[]) => void;
  maxFiles?: number;
  className?: string;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

export function MediaUploader({
  onMediaChange,
  maxFiles = 10,
  className,
}: MediaUploaderProps) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaData[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect aspect ratio from image dimensions
  const detectAspectRatio = (
    width: number,
    height: number
  ): "1:1" | "16:9" | "9:16" => {
    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.1) return "1:1";
    if (Math.abs(ratio - 16 / 9) < 0.2) return "16:9";
    if (Math.abs(ratio - 9 / 16) < 0.2) return "9:16";
    return "1:1"; // Default
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const totalFiles =
        uploadedMedia.length + uploadingFiles.length + fileArray.length;

      if (totalFiles > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} files`);
        return;
      }

      // Validate files
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

      // Create preview URLs and add to uploading state
      const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Upload files
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const uploadingIndex = uploadingFiles.length + i;

        try {
          // Simulate progress (in production, use actual upload progress)
          setUploadingFiles((prev) =>
            prev.map((uf, idx) =>
              idx === uploadingIndex ? { ...uf, progress: 50 } : uf
            )
          );

          const uploadResult = await UploadService.uploadPostMedia(file);

          // Detect aspect ratio for images
          let aspectRatio: "1:1" | "16:9" | "9:16" | undefined;
          if (file.type.startsWith("image/")) {
            const img = new Image();
            img.src = newUploadingFiles[i].preview;
            await new Promise((resolve) => {
              img.onload = () => {
                aspectRatio = detectAspectRatio(img.width, img.height);
                resolve(null);
              };
            });
          }

          const newMedia: MediaData = {
            url: uploadResult.url,
            type: file.type.startsWith("video/") ? "video" : "image",
            aspectRatio,
          };

          setUploadedMedia((prev) => {
            const updated = [...prev, newMedia];
            onMediaChange(updated);
            return updated;
          });

          // Remove from uploading
          setUploadingFiles((prev) =>
            prev.filter((_, idx) => idx !== uploadingIndex)
          );

          toast.success("Media uploaded successfully");
        } catch (error) {
          console.error("Upload error:", error);
          setUploadingFiles((prev) =>
            prev.map((uf, idx) =>
              idx === uploadingIndex ? { ...uf, error: "Upload failed" } : uf
            )
          );
          toast.error("Failed to upload media");
        }
      }
    },
    [uploadedMedia.length, uploadingFiles.length, maxFiles, onMediaChange]
  );

  const removeMedia = (index: number) => {
    setUploadedMedia((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onMediaChange(updated);
      return updated;
    });
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles((prev) => {
      const file = prev[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
        onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          Images or videos (up to {maxFiles} files, max 10MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Media Grid */}
      {(uploadedMedia.length > 0 || uploadingFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Uploaded Media */}
          {uploadedMedia.map((media, index) => (
            <Card
              key={`uploaded-${index}`}
              className="relative aspect-square overflow-hidden group">
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={() => removeMedia(index)}>
                <X className="h-4 w-4" />
              </Button>
              {media.aspectRatio && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {media.aspectRatio}
                </div>
              )}
            </Card>
          ))}

          {/* Uploading Files */}
          {uploadingFiles.map((file, index) => (
            <Card
              key={`uploading-${index}`}
              className="relative aspect-square overflow-hidden">
              {file.file.type.startsWith("image/") ? (
                <img
                  src={file.preview}
                  alt="Uploading..."
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center opacity-50">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                {file.error ? (
                  <div className="text-center">
                    <p className="text-white text-xs mb-2">{file.error}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeUploadingFile(index)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-white text-xs">{file.progress}%</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
