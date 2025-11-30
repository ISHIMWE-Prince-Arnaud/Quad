import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  timeAgo,
  formatDate,
  formatDateTime,
  isToday,
  isRecent,
} from "@/lib/timeUtils";

describe("Time Utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("timeAgo", () => {
    it("should return 'just now' for very recent times", () => {
      const date = new Date("2025-01-15T11:59:30Z");
      expect(timeAgo(date)).toBe("just now");
    });

    it("should return minutes ago", () => {
      const date = new Date("2025-01-15T11:45:00Z");
      expect(timeAgo(date)).toBe("15 minutes ago");
    });

    it("should return singular minute", () => {
      const date = new Date("2025-01-15T11:59:00Z");
      expect(timeAgo(date)).toBe("1 minute ago");
    });

    it("should return hours ago", () => {
      const date = new Date("2025-01-15T09:00:00Z");
      expect(timeAgo(date)).toBe("3 hours ago");
    });

    it("should return singular hour", () => {
      const date = new Date("2025-01-15T11:00:00Z");
      expect(timeAgo(date)).toBe("1 hour ago");
    });

    it("should return days ago", () => {
      const date = new Date("2025-01-13T12:00:00Z");
      expect(timeAgo(date)).toBe("2 days ago");
    });

    it("should return singular day", () => {
      const date = new Date("2025-01-14T12:00:00Z");
      expect(timeAgo(date)).toBe("1 day ago");
    });

    it("should return weeks ago", () => {
      const date = new Date("2025-01-01T12:00:00Z");
      expect(timeAgo(date)).toBe("2 weeks ago");
    });

    it("should return months ago", () => {
      const date = new Date("2024-11-15T12:00:00Z");
      expect(timeAgo(date)).toBe("2 months ago");
    });

    it("should return years ago", () => {
      const date = new Date("2023-01-15T12:00:00Z");
      expect(timeAgo(date)).toBe("2 years ago");
    });

    it("should handle string dates", () => {
      const result = timeAgo("2025-01-15T11:45:00Z");
      expect(result).toBe("15 minutes ago");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2025-01-15T12:00:00Z");
      const result = formatDate(date);
      expect(result).toMatch(/Jan 15, 2025/);
    });

    it("should handle string dates", () => {
      const result = formatDate("2025-01-15T12:00:00Z");
      expect(result).toMatch(/Jan 15, 2025/);
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time correctly", () => {
      const date = new Date("2025-01-15T15:45:00Z");
      const result = formatDateTime(date);
      expect(result).toMatch(/Jan 15, 2025/);
      expect(result).toMatch(/PM/);
    });

    it("should handle string dates", () => {
      const result = formatDateTime("2025-01-15T15:45:00Z");
      expect(result).toMatch(/Jan 15, 2025/);
    });
  });

  describe("isToday", () => {
    it("should return true for today's date", () => {
      const date = new Date("2025-01-15T08:00:00Z");
      expect(isToday(date)).toBe(true);
    });

    it("should return false for yesterday", () => {
      const date = new Date("2025-01-14T12:00:00Z");
      expect(isToday(date)).toBe(false);
    });

    it("should return false for tomorrow", () => {
      const date = new Date("2025-01-16T12:00:00Z");
      expect(isToday(date)).toBe(false);
    });

    it("should handle string dates", () => {
      expect(isToday("2025-01-15T08:00:00Z")).toBe(true);
    });
  });

  describe("isRecent", () => {
    it("should return true for dates within 24 hours", () => {
      const date = new Date("2025-01-15T06:00:00Z");
      expect(isRecent(date)).toBe(true);
    });

    it("should return false for dates older than 24 hours", () => {
      const date = new Date("2025-01-14T11:00:00Z");
      expect(isRecent(date)).toBe(false);
    });

    it("should handle string dates", () => {
      expect(isRecent("2025-01-15T06:00:00Z")).toBe(true);
    });
  });
});
