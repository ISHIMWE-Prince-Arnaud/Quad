import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
} from "framer-motion";
import {
  MockPostCard,
  MockPollCard,
  MockStoryCard,
  MockChatCard,
  MockNotificationCard,
  MockProfileCard,
} from "./MockCards";

const CARDS = [
  { id: "post", component: <MockPostCard /> },
  { id: "poll", component: <MockPollCard /> },
  { id: "story", component: <MockStoryCard /> },
  { id: "chat", component: <MockChatCard /> },
  { id: "notif", component: <MockNotificationCard /> },
  { id: "profile", component: <MockProfileCard /> },
];

// Duplicate just one extra card (the first one) to allow the "scroll up" loop
const DISPLAY_CARDS = [...CARDS, CARDS[0]];

export function LeftPanelCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Use a motion value for controlled animation
  const y = useMotionValue(0);

  // Constants for spacing - will be computed when containerHeight > 0
  const itemHeight = containerHeight * 0.5;
  const gap = containerHeight * 0.02;
  const itemSpacing = itemHeight + gap;
  const centerOffset = (containerHeight - itemHeight) / 2;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const h = containerRef.current.offsetHeight;
        setContainerHeight(h);

        // Ensure starting position is correct on load
        const initialItemHeight = h * 0.5;
        const initialCenterOffset = (h - initialItemHeight) / 2;
        const initialItemSpacing = initialItemHeight + h * 0.02;

        // Set y to center the current activeIndex
        y.set(initialCenterOffset - activeIndex * initialItemSpacing);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (containerHeight === 0) return;

    // Timer for the 10-second static wait
    const timer = setTimeout(() => {
      const nextIndex = activeIndex + 1;
      const targetY = centerOffset - nextIndex * itemSpacing;

      // Animate the transition (takes 1.5 seconds)
      animate(y, targetY, {
        duration: 1.5,
        ease: [0.32, 0.72, 0, 1], // Smooth snappy ease
        onComplete: () => {
          if (nextIndex >= CARDS.length) {
            // We've reached the duplicated first card at the end
            // Instantly snap back to the start position for index 0
            y.set(centerOffset);
            setActiveIndex(0);
          } else {
            setActiveIndex(nextIndex);
          }
        },
      });
    }, 10000); // 10 seconds of static view

    return () => clearTimeout(timer);
  }, [containerHeight, activeIndex, itemSpacing, centerOffset, y]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden flex flex-col items-center"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
      }}>
      <motion.div className="flex flex-col gap-[2vh] w-full" style={{ y }}>
        {DISPLAY_CARDS.map((card, index) => (
          <CarouselItem
            key={`${card.id}-${index}`}
            index={index}
            y={y}
            containerHeight={containerHeight}>
            {card.component}
          </CarouselItem>
        ))}
      </motion.div>
    </div>
  );
}

function CarouselItem({
  children,
  index,
  y,
  containerHeight,
}: {
  children: React.ReactNode;
  index: number;
  y: MotionValue<number>;
  containerHeight: number;
}) {
  const itemHeight = containerHeight * 0.5;
  const gap = containerHeight * 0.02;
  const itemSpacing = itemHeight + gap;
  const itemCenter = index * itemSpacing + itemHeight / 2;
  const viewportCenter = containerHeight / 2;

  // Transform values based on distance from center
  const scale = useTransform(y, (latestY) => {
    const currentCenter = itemCenter + latestY;
    const distanceFromCenter = Math.abs(viewportCenter - currentCenter);
    // Very subtle scaling
    const maxDist = containerHeight * 0.8;
    const factor = Math.min(distanceFromCenter / maxDist, 1);
    return 1 - factor * 0.1;
  });

  const opacity = useTransform(y, (latestY) => {
    const currentCenter = itemCenter + latestY;
    const distanceFromCenter = Math.abs(viewportCenter - currentCenter);
    const maxDist = containerHeight * 0.8;
    const factor = Math.min(distanceFromCenter / maxDist, 1);
    // High minimum opacity to keep all cards visible
    return 1 - factor * 0.3;
  });

  // Removed dynamic blur to keep cards sharp
  const filter = "blur(0px)";

  const shadow = useTransform(y, (latestY) => {
    const currentCenter = itemCenter + latestY;
    const distanceFromCenter = Math.abs(viewportCenter - currentCenter);
    const maxDist = containerHeight * 0.25;
    const factor = 1 - Math.min(distanceFromCenter / maxDist, 1);
    return `0 ${20 * factor}px ${40 * factor}px -10px hsla(var(--primary) / ${0.2 * factor})`;
  });

  return (
    <motion.div
      style={{
        height: itemHeight,
        scale,
        opacity,
        filter: filter as any,
        boxShadow: shadow,
      }}
      className="w-full shrink-0 flex items-center justify-center rounded-[2rem] overflow-hidden">
      {children}
    </motion.div>
  );
}
