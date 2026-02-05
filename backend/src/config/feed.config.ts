export const FEED_CONFIG = {
  // Distribution ratios for "For You" feed
  FOR_YOU: {
    FOLLOWING_RATIO: 0.7,
    DISCOVERY_RATIO: 0.3,
  },

  // Distribution ratios for mixed content types (Home tab)
  CONTENT_MIX: {
    POSTS_RATIO: 0.7,
    POLLS_RATIO: 0.3,
  },

  // Default limits
  DEFAULT_LIMIT: 20,
} as const;
