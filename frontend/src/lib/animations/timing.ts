/**
 * Theme transition configuration
 * Used for smooth theme switching
 * Validates: Requirements 1.3, 2.6
 */
export const themeTransitionConfig = {
  duration: 300, // milliseconds
  ease: "ease-in-out",
};

/**
 * Microinteraction timing constraint
 * All microinteractions should complete within this duration
 * Validates: Requirements 2.6
 */
export const MICROINTERACTION_MAX_DURATION = 300; // milliseconds

/**
 * Loading spinner timing
 * Minimum time before showing loading spinner
 * Validates: Requirements 14.4
 */
export const LOADING_SPINNER_DELAY = 500; // milliseconds

/**
 * Interaction feedback timing
 * Maximum time for providing visual feedback
 * Validates: Requirements 14.5
 */
export const INTERACTION_FEEDBACK_MAX_DELAY = 100; // milliseconds
