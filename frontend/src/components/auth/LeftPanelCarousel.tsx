import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
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

// Duplicate for seamless loop
const DISPLAY_CARDS = [...CARDS, ...CARDS, ...CARDS];

export function LeftPanelCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Use a motion value for continuous animation
  const y = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation speed: pixels per frame equivalent
  const speed = 0.5;

  useAnimationFrame(() => {
    if (containerHeight === 0) return;

    // Calculate how much we've moved
    const currentY = y.get();
    const itemHeight = containerHeight * 0.55; // Approx height including space
    const totalLoopHeight = itemHeight * CARDS.length;

    let nextY = currentY - speed;

    // Reset when we've scrolled past one full set of cards
    if (nextY <= -totalLoopHeight) {
      nextY = 0;
    }

    y.set(nextY);
  });

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden flex flex-col items-center"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
      }}>
      <motion.div className="flex flex-col gap-[5vh] w-full" style={{ y }}>
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
  const itemHeight = containerHeight * 0.5; // Center card is 50%
  const gap = containerHeight * 0.05; // Space is 5%

  // Calculate this item's relative center position in the scroll list
  // Note: cards are spaced by itemHeight + gap
  const itemCenter = index * (itemHeight + gap) + itemHeight / 2;

  // We want to calculate how far this item's center is from the viewport center
  // Viewport center is at containerHeight / 2
  // Current item center in viewport = itemCenter + currentY

  const viewportCenter = containerHeight / 2;

  // Transform values based on distance from center
  // Scale from 0.85 to 1.0
  const scale = useTransform(y, (latestY) => {
    const currentCenter = itemCenter + latestY;
    const distanceFromCenter = Math.abs(viewportCenter - currentCenter);
    const maxDist = containerHeight * 0.4;
    const factor = Math.min(distanceFromCenter / maxDist, 1);
    return 1 - factor * 0.15;
  });

  // Opacity from 0.3 to 1.0
  const opacity = useTransform(y, (latestY) => {
    const currentCenter = itemCenter + latestY;
    const distanceFromCenter = Math.abs(viewportCenter - currentCenter);
    const maxDist = containerHeight * 0.5;
    const factor = Math.min(distanceFromCenter / maxDist, 1);
    return 1 - factor * 0.7;
  });

  // Blur from 0px to 4px
  const filter = useTransform(y, (latestY) => {
    const currentCenter = itemCenter + latestY;
    const distanceFromCenter = Math.abs(viewportCenter - currentCenter);
    const maxDist = containerHeight * 0.4;
    const factor = Math.min(distanceFromCenter / maxDist, 1);
    const blur = factor * 4;
    return `blur(${blur}px)`;
  });

  // Shadow for center card
  const shadow = useTransform(y, (latestY) => {
    const currentCenter = itemCenter + latestY;
    const distanceFromCenter = Math.abs(viewportCenter - currentCenter);
    const maxDist = containerHeight * 0.2;
    const factor = 1 - Math.min(distanceFromCenter / maxDist, 1);
    return `0 ${20 * factor}px ${40 * factor}px -10px rgba(0,0,0,${0.3 * factor})`;
  });

  return (
    <motion.div
      style={{
        height: itemHeight,
        scale,
        opacity,
        filter,
        boxShadow: shadow,
      }}
      className="w-full shrink-0 flex items-center justify-center rounded-[2rem] overflow-hidden">
      {children}
    </motion.div>
  );
}
