import { useEffect, useState } from "react";

export function useNearBottom(
  ref: Readonly<{ current: HTMLElement | null }>,
  threshold = 120
) {
  const [nearBottom, setNearBottom] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setNearBottom(distance < threshold);
    };
    el.addEventListener("scroll", handler);
    handler();
    return () => el.removeEventListener("scroll", handler);
  }, [ref, threshold]);
  return nearBottom;
}
