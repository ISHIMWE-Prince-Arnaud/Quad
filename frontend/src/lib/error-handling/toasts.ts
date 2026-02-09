import { toast } from "react-hot-toast";
import { createAppError } from "./appError";

export function showErrorToast(error: unknown, customMessage?: string): void {
  // If the error is just a string and no custom message, treat it as the message directly
  if (typeof error === "string" && !customMessage) {
    toast.error(error);
    return;
  }

  const appError = createAppError(error);
  // Prefer custom message if provided, otherwise use the error's message
  const message = customMessage || appError.message;

  toast.error(message);
}

export function showSuccessToast(message: string): void {
  toast.success(message);
}

export function showWarningToast(message: string): void {
  toast(message, {
    icon: "⚠️",
    style: {
      border: "1px solid #F59E0B", // Amber-500
      padding: "16px",
      color: "#D97706", // Amber-600
    },
  });
}

export function showInfoToast(message: string): void {
  toast(message, {
    icon: "ℹ️",
    style: {
      border: "1px solid #3B82F6", // Blue-500
      padding: "16px",
      color: "#2563EB", // Blue-600
    },
  });
}
