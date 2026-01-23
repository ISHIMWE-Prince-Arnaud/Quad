import { useEffect, useRef, useState } from "react";

export function useNearBottom(
  ref: Readonly<{ current: HTMLElement | null }>,
  threshold = 120,
  onChange?: (nearBottom: boolean) => void
) {
  const [nearBottom, setNearBottom] = useState(true);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const next = distance < threshold;
      setNearBottom((prev) => {
        if (prev !== next) onChangeRef.current?.(next);
        return next;
      });
    };
    el.addEventListener("scroll", handler);

    const raf = requestAnimationFrame(handler);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", handler);
    };
  }, [ref, threshold]);
  return nearBottom;
}
