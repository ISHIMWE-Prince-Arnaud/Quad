export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

export function validateFileExtension(file: File): boolean {
  if (!file || !file.name) return false;

  const extension = file.name.split(".").pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const validMappings: Record<string, string[]> = {
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    gif: ["image/gif"],
    webp: ["image/webp"],
    mp4: ["video/mp4"],
    webm: ["video/webm"],
    pdf: ["application/pdf"],
  };

  if (!extension || !validMappings[extension]) {
    return false;
  }

  return validMappings[extension].includes(mimeType);
}

export interface FileValidationOptions {
  allowedTypes: string[];
  maxSizeBytes: number;
  checkExtension?: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  options: FileValidationOptions
): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!validateFileSize(file, options.maxSizeBytes)) {
    const maxSizeMB = (options.maxSizeBytes / (1024 * 1024)).toFixed(2);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  if (!validateFileType(file, options.allowedTypes)) {
    return { valid: false, error: "File type not allowed" };
  }

  if (options.checkExtension !== false && !validateFileExtension(file)) {
    return { valid: false, error: "File extension does not match file type" };
  }

  return { valid: true };
}
