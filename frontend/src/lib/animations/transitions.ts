import type { Transition } from "framer-motion";

export const pageTransitionConfig: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const modalTransitionConfig: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth feel
};

export const reactionPopConfig: Transition = {
  duration: 0.3,
  times: [0, 0.6, 1],
  ease: "easeOut",
};

export const feedItemMountConfig: Transition = {
  duration: 0.3,
  ease: "easeOut",
};

export const messageSlideInConfig: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const typingIndicatorConfig: Transition = {
  duration: 1.5,
  repeat: Infinity,
  ease: "easeInOut",
};

export const badgePulseConfig: Transition = {
  duration: 0.3,
  ease: "easeOut",
};

export const skeletonShimmerConfig: Transition = {
  duration: 2,
  repeat: Infinity,
  ease: "linear",
};

export const fadeInConfig: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const scaleInConfig: Transition = {
  duration: 0.15,
  ease: "easeOut",
};

export const slideConfig: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const bounceConfig: Transition = {
  duration: 0.6,
  ease: "easeInOut",
};

export const rotateConfig: Transition = {
  duration: 1,
  repeat: Infinity,
  ease: "linear",
};

/**
 * Spring animation configuration
 * Used for more natural, physics-based animations
 */
export const springConfig: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const gentleSpringConfig: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const backdropFadeConfig: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const pollBarGrowConfig: Transition = {
  duration: 0.5,
  ease: "easeOut",
};
