import { toast } from "react-hot-toast";

import { createAppError } from "./appError";

export function showErrorToast(error: unknown, customMessage?: string): void {
  const appError = createAppError(error);
  const message = customMessage || appError.message;

  toast.error(message);
}

export function showSuccessToast(message: string, description?: string): void {
  toast.success(description ? `${message}: ${description}` : message);
}
