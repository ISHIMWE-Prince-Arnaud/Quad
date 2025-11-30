/**
 * React hook for sanitizing user inputs
 */

import { useCallback } from "react";
import { sanitizeInput, sanitizeForDisplay, stripHTML } from "@/lib/security";

export function useSanitizedInput() {
  const sanitize = useCallback((input: string): string => {
    return sanitizeInput(input);
  }, []);

  const sanitizeDisplay = useCallback((input: string): string => {
    return sanitizeForDisplay(input);
  }, []);

  const strip = useCallback((input: string): string => {
    return stripHTML(input);
  }, []);

  return {
    sanitize,
    sanitizeDisplay,
    strip,
  };
}
