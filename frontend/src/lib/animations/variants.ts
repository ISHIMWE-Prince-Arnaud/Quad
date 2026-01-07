import type { Variants } from "framer-motion";

/**
 * Page transition animation
 * Used for route changes and page loads
 * Validates: Requirements 2.1
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Card hover animation
 * Used for post cards, story cards, and other hoverable cards
 * Validates: Requirements 3.3, 6.5
 */
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

/**
 * Modal/Dialog open animation
 * Used for modals, dialogs, and lightboxes
 * Validates: Requirements 2.4, 12.1
 */
export const modalOpen: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

/**
 * Reaction pop animation
 * Used when users add reactions to posts/comments
 * Validates: Requirements 2.2, 16.2
 */
export const reactionPop: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: [0, 1.2, 1],
  },
};

/**
 * Feed item mount animation
 * Used when new posts appear in the feed
 * Validates: Requirements 2.3
 */
export const feedItemMount: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

/**
 * Chat message slide-in animation
 * Used for incoming chat messages
 * Validates: Requirements 8.3
 */
export const messageSlideIn: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Typing indicator animation
 * Used to show when someone is typing in chat
 * Validates: Requirements 2.5
 */
export const typingIndicator: Variants = {
  animate: {
    opacity: [0.4, 1, 0.4],
  },
};

/**
 * Notification badge pulse animation
 * Used when new notifications arrive
 * Validates: Requirements 10.4
 */
export const badgePulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
  },
};

/**
 * Skeleton shimmer animation
 * Used for loading states
 * Validates: Requirements 14.2
 */
export const skeletonShimmer: Variants = {
  animate: {
    backgroundPosition: ["0% 0%", "100% 0%"],
  },
};

/**
 * Fade in animation
 * Generic fade in for various elements
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Scale in animation
 * Used for popovers, dropdowns, and tooltips
 */
export const scaleIn: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

/**
 * Slide in from direction animations
 * Used for sidebars, drawers, and slide-in panels
 */
export const slideInFromLeft: Variants = {
  initial: { x: "-100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

export const slideInFromRight: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};

export const slideInFromTop: Variants = {
  initial: { y: "-100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "-100%", opacity: 0 },
};

export const slideInFromBottom: Variants = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0 },
};

/**
 * Stagger children animation
 * Used for lists and grids that animate in sequence
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Bounce animation
 * Used for playful interactions
 */
export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
  },
};

/**
 * Rotation animation
 * Used for loading spinners and refresh icons
 */
export const rotate: Variants = {
  animate: {
    rotate: 360,
  },
};

/**
 * Lightbox backdrop animation
 * Used for modal/lightbox backdrops
 * Validates: Requirements 12.4
 */
export const backdropFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Poll bar animation
 * Used for animating poll percentage bars
 * Validates: Requirements 5.2, 5.4
 */
export const pollBarGrow: Variants = {
  initial: { width: 0 },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
  }),
};
