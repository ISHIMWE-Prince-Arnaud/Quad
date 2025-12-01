// Test setup file for vitest
import { vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock localStorage with actual storage
const storage: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    Object.keys(storage).forEach((key) => delete storage[key]);
  },
  get length() {
    return Object.keys(storage).length;
  },
  key: (index: number) => {
    const keys = Object.keys(storage);
    return keys[index] || null;
  },
};

global.localStorage = localStorageMock as any;
global.sessionStorage = localStorageMock as any;

// Set up a mock auth token for all tests
beforeEach(() => {
  // Set a mock JWT token for authenticated requests
  localStorage.setItem("clerk-db-jwt", "mock-test-jwt-token");
});

// Mock CSRF protection module
vi.mock("@/lib/csrfProtection", () => ({
  getCSRFToken: () => "mock-csrf-token",
  setCSRFToken: vi.fn(),
  clearCSRFToken: vi.fn(),
}));

// Mock rate limit handler module
vi.mock("@/lib/rateLimitHandler", () => ({
  rateLimitManager: {
    recordRateLimit: vi.fn(),
    isRateLimited: vi.fn(() => false),
    getRateLimitInfo: vi.fn(() => null),
  },
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
