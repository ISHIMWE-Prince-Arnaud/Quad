import { AlertCircle } from "lucide-react";

export function UploadErrorAlert({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">{error}</span>
    </div>
  );
}
