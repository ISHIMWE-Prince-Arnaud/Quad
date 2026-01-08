/**
 * Performance monitoring utility
 * Tracks performance metrics and slow operations
 */

import { logError } from "./errorHandling";

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface SlowQueryThresholds {
  api: number; // API calls
  render: number; // Component renders
  interaction: number; // User interactions
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private slowQueryThresholds: SlowQueryThresholds = {
    api: 1000, // 1 second
    render: 100, // 100ms
    interaction: 200, // 200ms
  };

  /**
   * Start measuring performance
   */
  startMeasure(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
      });
    };
  }

  /**
   * Measure async operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        metadata,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric({
        name: `${name} (error)`,
        duration,
        timestamp: Date.now(),
        metadata: { ...metadata, error: String(error) },
      });

      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Check for slow operations
    this.checkSlowOperation(metric);
  }

  /**
   * Check if operation is slow and log warning
   */
  private checkSlowOperation(metric: PerformanceMetric): void {
    let threshold: number | null = null;
    let type: string | null = null;

    if (metric.name.startsWith("api:")) {
      threshold = this.slowQueryThresholds.api;
      type = "API call";
    } else if (metric.name.startsWith("render:")) {
      threshold = this.slowQueryThresholds.render;
      type = "Render";
    } else if (metric.name.startsWith("interaction:")) {
      threshold = this.slowQueryThresholds.interaction;
      type = "Interaction";
    }

    if (threshold && metric.duration > threshold) {
      logError(
        new Error(
          `[Performance] Slow ${type}: ${metric.name} took ${metric.duration.toFixed(2)}ms`
        ),
        {
          component: "PerformanceMonitor",
          action: "slowOperation",
          metadata: { ...metric.metadata, name: metric.name, duration: metric.duration, type },
        }
      );
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (this.metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0,
      };
    }

    const durations = this.metrics.map((m) => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: this.metrics.length,
      avgDuration: sum / this.metrics.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
    };
  }

  /**
   * Get metrics by name pattern
   */
  getMetricsByPattern(pattern: RegExp): PerformanceMetric[] {
    return this.metrics.filter((m) => pattern.test(m.name));
  }

  /**
   * Get slow operations
   */
  getSlowOperations(threshold?: number): PerformanceMetric[] {
    const actualThreshold = threshold ?? this.slowQueryThresholds.api;
    return this.metrics.filter((m) => m.duration > actualThreshold);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Set slow query thresholds
   */
  setThresholds(thresholds: Partial<SlowQueryThresholds>): void {
    this.slowQueryThresholds = {
      ...this.slowQueryThresholds,
      ...thresholds,
    };
  }

  /**
   * Get Web Vitals if available
   */
  getWebVitals() {
    if (typeof window === "undefined" || !window.performance) {
      return null;
    }

    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (!navigation) {
      return null;
    }

    return {
      // Time to First Byte
      ttfb: navigation.responseStart - navigation.requestStart,
      // DOM Content Loaded
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      // Load Complete
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      // Total Load Time
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
    };
  }

  /**
   * Monitor bundle sizes (requires build-time integration)
   */
  logBundleInfo() {
    if (typeof window === "undefined") {
      return;
    }

    // Log loaded scripts
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    void scripts;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Log web vitals on load
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const vitals = performanceMonitor.getWebVitals();
      performanceMonitor.logBundleInfo();
      void vitals;
    }, 0);
  });
}

/**
 * React hook for measuring component render performance
 */
export function useMeasureRender(componentName: string) {
  if (typeof window === "undefined") {
    return;
  }

  const endMeasure = performanceMonitor.startMeasure(`render:${componentName}`);

  // Call endMeasure after render
  setTimeout(endMeasure, 0);
}
