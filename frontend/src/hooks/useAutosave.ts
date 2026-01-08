import { useEffect, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";
import { logError } from "@/lib/errorHandling";

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => void | Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedData = useDebounce(data, delay);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip autosave on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) {
      return;
    }

    const save = async () => {
      setIsSaving(true);
      try {
        await onSave(debouncedData);
        setLastSaved(new Date());
      } catch (error) {
        logError(error, { component: "useAutosave", action: "save" });
      } finally {
        setIsSaving(false);
      }
    };

    void save();
  }, [debouncedData, enabled, onSave]);

  return {
    isSaving,
    lastSaved,
  };
}
