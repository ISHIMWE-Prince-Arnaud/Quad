import type { PollOption } from "@/types/poll";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function PollOptionBar({
  option,
  totalVotes,
  showResults,
  selected,
  dimmed,
  disabled,
  onClick,
}: {
  option: PollOption;
  totalVotes: number;
  showResults: boolean;
  selected?: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const votesCount = option.votesCount ?? 0;
  const percentage = useMemo(() => {
    if (typeof option.percentage === "number") return option.percentage;
    if (totalVotes <= 0) return 0;
    return Math.round((votesCount / totalVotes) * 100);
  }, [option.percentage, totalVotes, votesCount]);

  const [displayPercentage, setDisplayPercentage] = useState(
    showResults ? percentage : 0
  );

  const [barWidth, setBarWidth] = useState(showResults ? percentage : 0);
  const prevShowResultsRef = useRef(showResults);
  const prevSelectedRef = useRef(Boolean(selected));

  useEffect(() => {
    if (!showResults) {
      const raf = requestAnimationFrame(() => setDisplayPercentage(0));
      return () => cancelAnimationFrame(raf);
    }

    const durationMs = 320;
    const start = performance.now();
    const target = percentage;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayPercentage(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [percentage, showResults]);

  useEffect(() => {
    // Always animate the fill from 0 when it first becomes visible.
    // - During the immediate "selection" phase (selected=true but showResults=false),
    //   we still animate the bar fill to provide instant visual feedback.
    // - During results, updates animate smoothly as percentages change.
    const prevShowResults = prevShowResultsRef.current;
    const prevSelected = prevSelectedRef.current;

    prevShowResultsRef.current = showResults;
    prevSelectedRef.current = Boolean(selected);

    let raf1 = 0;
    let raf2 = 0;

    if (!showResults && !selected) {
      raf1 = requestAnimationFrame(() => setBarWidth(0));
      return () => cancelAnimationFrame(raf1);
    }

    const shouldAnimateFromZero =
      (showResults && !prevShowResults) || (Boolean(selected) && !prevSelected);

    if (shouldAnimateFromZero) {
      raf1 = requestAnimationFrame(() => {
        setBarWidth(0);
        raf2 = requestAnimationFrame(() => setBarWidth(percentage));
      });
    } else {
      raf1 = requestAnimationFrame(() => setBarWidth(percentage));
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [percentage, selected, showResults]);

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "relative h-11 w-full overflow-hidden rounded-full border text-left transition-all duration-200",
        "border-white/10 bg-white/[0.03]",
        !disabled && "hover:bg-white/[0.06]",
        disabled && "cursor-default",
        dimmed && "opacity-55",
        selected && "ring-2 ring-[#2563eb]",
        selected && !disabled && "scale-[1.01]"
      )}>
      <div
        className={
          "absolute inset-y-0 left-0 rounded-full overflow-hidden transition-[width] duration-500 "
        }
        style={{ width: `${barWidth}%` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] to-[#2563eb]" />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-[#60a5fa] to-[#2563eb] transition-opacity duration-300",
            selected ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      <div className="relative z-10 flex h-full items-center justify-between gap-4 px-5">
        <span
          className={cn(
            "min-w-0 truncate text-[13px] font-semibold",
            selected ? "text-white" : "text-white",
            disabled && selected && "text-white"
          )}>
          {option.text}
        </span>

        {showResults && (
          <span className="shrink-0 text-[13px] font-semibold text-white/90">
            {displayPercentage}%
          </span>
        )}
      </div>
    </button>
  );
}
