import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatDate,
  formatRelativeTime,
  truncateText,
  generateId,
  sleep,
  debounce,
} from "@/lib/utils";

describe("Utils", () => {
  describe("cn (className merger)", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("should merge tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });
  });

  describe("formatDate", () => {
    it("should format date string", () => {
      const result = formatDate("2025-01-15T12:00:00Z");
      expect(result).toMatch(/January 15, 2025/);
    });

    it("should format Date object", () => {
      const date = new Date("2025-01-15T12:00:00Z");
      const result = formatDate(date);
      expect(result).toMatch(/January 15, 2025/);
    });
  });

  describe("formatRelativeTime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 'just now' for recent times", () => {
      const date = new Date("2025-01-15T11:59:30Z");
      expect(formatRelativeTime(date)).toBe("just now");
    });

    it("should return minutes ago", () => {
      const date = new Date("2025-01-15T11:45:00Z");
      expect(formatRelativeTime(date)).toBe("15m ago");
    });

    it("should return hours ago", () => {
      const date = new Date("2025-01-15T09:00:00Z");
      expect(formatRelativeTime(date)).toBe("3h ago");
    });

    it("should return days ago", () => {
      const date = new Date("2025-01-13T12:00:00Z");
      expect(formatRelativeTime(date)).toBe("2d ago");
    });

    it("should return formatted date for old dates", () => {
      const date = new Date("2024-12-01T12:00:00Z");
      const result = formatRelativeTime(date);
      expect(result).toMatch(/December/);
    });
  });

  describe("truncateText", () => {
    it("should not truncate short text", () => {
      expect(truncateText("Hello", 10)).toBe("Hello");
    });

    it("should truncate long text", () => {
      expect(truncateText("Hello World", 5)).toBe("Hello...");
    });

    it("should handle exact length", () => {
      expect(truncateText("Hello", 5)).toBe("Hello");
    });
  });

  describe("generateId", () => {
    it("should generate a string", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
    });

    it("should generate unique ids", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it("should generate ids of reasonable length", () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
      expect(id.length).toBeLessThan(20);
    });
  });

  describe("sleep", () => {
    it("should resolve after specified time", async () => {
      vi.useFakeTimers();
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
      vi.useRealTimers();
    });
  });

  describe("debounce", () => {
    it("should debounce function calls", () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it("should pass arguments to debounced function", () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced("arg1", "arg2");

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
      vi.useRealTimers();
    });
  });
});
