import { toast } from "@/hooks/use-toast";

import { createAppError } from "./appError";

export function showErrorToast(error: unknown, customMessage?: string): void {
  const appError = createAppError(error);
  const message = customMessage || appError.message;

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}

export function showSuccessToast(message: string, description?: string): void {
  toast({
    title: message,
    description,
    variant: "default",
  });
}
