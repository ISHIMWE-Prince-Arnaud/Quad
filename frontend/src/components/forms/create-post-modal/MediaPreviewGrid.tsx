import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MediaData } from "@/schemas/post.schema";

import type { UploadingFile } from "./types";

export function MediaPreviewGrid({
  uploadedMedia,
  uploadingFiles,
  onRemoveMedia,
  onRemoveUploadingFile,
}: {
  uploadedMedia: MediaData[];
  uploadingFiles: UploadingFile[];
  onRemoveMedia: (index: number) => void;
  onRemoveUploadingFile: (index: number) => void;
}) {
  return (
    <AnimatePresence mode="popLayout">
      {(uploadedMedia.length > 0 || uploadingFiles.length > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 gap-3">
          {uploadedMedia.map((media, index) => (
            <motion.div
              key={`uploaded-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}>
              <Card className="relative aspect-square overflow-hidden group">
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Video</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 rounded-full"
                  onClick={() => onRemoveMedia(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          ))}

          {uploadingFiles.map((file, index) => (
            <motion.div
              key={`uploading-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}>
              <Card className="relative aspect-square overflow-hidden">
                {file.file.type.startsWith("image/") ? (
                  <img
                    src={file.preview}
                    alt="Uploading..."
                    className="w-full h-full object-cover opacity-50"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center opacity-50">
                    <span className="text-sm text-muted-foreground">Video</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  {file.error ? (
                    <div className="text-center p-4">
                      <p className="text-white text-xs mb-2">{file.error}</p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onRemoveUploadingFile(index)}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                      <p className="text-white text-xs">{file.progress}%</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
