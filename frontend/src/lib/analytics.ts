/**
 * Analytics Integration
 * Integrates with Google Analytics or similar analytics service
 */

import { env, isProduction } from "./envValidation";
import { logError } from "./errorHandling";

interface AnalyticsConfig {
  measurementId?: string;
  enabled: boolean;
}

interface PageViewData {
  page_title?: string;
  page_location?: string;
  page_path?: string;
}

interface EventData {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

interface UserProperties {
  [key: string]: unknown;
}

class Analytics {
  private config: AnalyticsConfig;
  private initialized = false;

  constructor() {
    this.config = {
      measurementId: env.gaMeasurementId,
      enabled: env.enableAnalytics && !!env.gaMeasurementId && isProduction,
    };
  }

  /**
   * Initialize analytics
   * Call this once at app startup
   */
  initialize(): void {
    if (!this.config.enabled || this.initialized) {
      return;
    }

    try {
      // Load Google Analytics script
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;

      gtag("js", new Date());
      gtag("config", this.config.measurementId, {
        send_page_view: false, // We'll send page views manually
        anonymize_ip: true, // Anonymize IP for privacy
      });

      this.initialized = true;
    } catch (error) {
      logError(error, { component: "Analytics", action: "initialize" });
    }
  }

  /**
   * Track page view
   */
  pageView(data?: PageViewData): void {
    if (!this.config.enabled || !this.initialized) return;

    try {
      window.gtag?.("event", "page_view", {
        page_title: data?.page_title || document.title,
        page_location: data?.page_location || window.location.href,
        page_path: data?.page_path || window.location.pathname,
      });
    } catch (error) {
      logError(error, { component: "Analytics", action: "pageView" });
    }
  }

  /**
   * Track custom event
   */
  event(eventName: string, data?: EventData): void {
    if (!this.config.enabled || !this.initialized) return;

    try {
      window.gtag?.("event", eventName, data);
    } catch (error) {
      logError(error, {
        component: "Analytics",
        action: "event",
        metadata: { eventName },
      });
    }
  }

  /**
   * Track user action events
   */
  trackAction(
    action: string,
    category: string,
    label?: string,
    value?: number
  ): void {
    this.event(action, {
      event_category: category,
      event_label: label,
      value,
    });
  }

  /**
   * Track content interactions
   */
  trackContentInteraction(
    contentType: "post" | "story" | "poll",
    action: string,
    contentId?: string
  ): void {
    this.event("content_interaction", {
      content_type: contentType,
      action,
      content_id: contentId,
    });
  }

  /**
   * Track social interactions
   */
  trackSocialInteraction(
    action: "follow" | "unfollow" | "reaction" | "comment",
    targetUserId?: string
  ): void {
    this.event("social_interaction", {
      action,
      target_user_id: targetUserId,
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string, resultCount?: number): void {
    this.event("search", {
      search_term: searchTerm,
      result_count: resultCount,
    });
  }

  /**
   * Track errors
   */
  trackError(errorMessage: string, errorType?: string, fatal = false): void {
    this.event("exception", {
      description: errorMessage,
      error_type: errorType,
      fatal,
    });
  }

  /**
   * Track timing (performance metrics)
   */
  trackTiming(
    category: string,
    variable: string,
    value: number,
    label?: string
  ): void {
    this.event("timing_complete", {
      name: variable,
      value,
      event_category: category,
      event_label: label,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.config.enabled || !this.initialized) return;

    try {
      window.gtag?.("set", "user_properties", properties);
    } catch (error) {
      logError(error, { component: "Analytics", action: "setUserProperties" });
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string | null): void {
    if (!this.config.enabled || !this.initialized) return;

    try {
      if (userId) {
        window.gtag?.("config", this.config.measurementId, {
          user_id: userId,
        });
      }
    } catch (error) {
      logError(error, { component: "Analytics", action: "setUserId" });
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience functions for common tracking scenarios
export const trackPageView = (data?: PageViewData) => analytics.pageView(data);
export const trackEvent = (eventName: string, data?: EventData) =>
  analytics.event(eventName, data);
export const trackPostCreated = () =>
  analytics.trackContentInteraction("post", "create");
export const trackPostLiked = (postId: string) =>
  analytics.trackContentInteraction("post", "like", postId);
export const trackStoryViewed = (storyId: string) =>
  analytics.trackContentInteraction("story", "view", storyId);
export const trackPollVoted = (pollId: string) =>
  analytics.trackContentInteraction("poll", "vote", pollId);
export const trackUserFollowed = (userId: string) =>
  analytics.trackSocialInteraction("follow", userId);
export const trackSearch = (query: string, count?: number) =>
  analytics.trackSearch(query, count);
