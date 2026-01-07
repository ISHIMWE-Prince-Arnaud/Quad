export interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}
