// Test utilities and helpers for Vitest and React Testing Library
import { vi } from "vitest";
import { render, type RenderOptions } from "@testing-library/react";
import React, { type ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import * as fc from "fast-check";

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) =>
      React.createElement(BrowserRouter, null, children),
    ...options,
  });
}

/**
 * Mock window dimensions for responsive testing
 */
export function mockWindowDimensions(width: number, height: number = 768) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event("resize"));
}

/**
 * Mock matchMedia for theme and responsive testing
 */
export function mockMatchMedia(matches: boolean = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Create a mock Socket.IO client for testing real-time features
 */
export function createMockSocket() {
  const eventHandlers: Record<string, Function[]> = {};

  return {
    on: vi.fn((event: string, handler: Function) => {
      if (!eventHandlers[event]) {
        eventHandlers[event] = [];
      }
      eventHandlers[event].push(handler);
    }),
    off: vi.fn((event: string, handler: Function) => {
      if (eventHandlers[event]) {
        eventHandlers[event] = eventHandlers[event].filter(
          (h) => h !== handler
        );
      }
    }),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    _triggerEvent: (event: string, data: unknown) => {
      if (eventHandlers[event]) {
        eventHandlers[event].forEach((handler) => handler(data));
      }
    },
    _getHandlers: () => eventHandlers,
  };
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync(ms: number = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fast-check arbitraries for common data types
 */
export const arbitraries = {
  // User data
  userId: () => fc.uuid(),
  username: () =>
    fc.stringMatching(/^[a-zA-Z0-9_]{3,20}$/).filter((s) => s.length >= 3),
  email: () => fc.emailAddress(),
  bio: () => fc.string({ minLength: 0, maxLength: 500 }),
  url: () => fc.webUrl(),

  // Content data
  postText: () => fc.string({ minLength: 1, maxLength: 500 }),
  commentText: () => fc.string({ minLength: 1, maxLength: 300 }),
  pollQuestion: () => fc.string({ minLength: 5, maxLength: 200 }),
  pollOption: () => fc.string({ minLength: 1, maxLength: 100 }),

  // Dates
  pastDate: () => fc.date({ max: new Date() }).map((d) => d.toISOString()),
  futureDate: () => fc.date({ min: new Date() }).map((d) => d.toISOString()),

  // Numbers
  positiveInt: () => fc.integer({ min: 1 }),
  nonNegativeInt: () => fc.integer({ min: 0 }),
  percentage: () => fc.integer({ min: 0, max: 100 }),

  // Pagination
  cursor: () => fc.option(fc.string(), { nil: null }),
  limit: () => fc.integer({ min: 1, max: 100 }),

  // Media
  imageUrl: () => fc.webUrl().map((url) => `${url}/image.jpg`),
  videoUrl: () => fc.webUrl().map((url) => `${url}/video.mp4`),
  mediaType: () => fc.constantFrom("image", "video" as const),

  // Content types
  contentType: () => fc.constantFrom("post", "story", "poll" as const),

  // Reactions
  emoji: () => fc.constantFrom("👍", "❤️", "😂", "😮", "😢", "🔥"),

  // Theme
  theme: () => fc.constantFrom("light", "dark", "system" as const),
};

/**
 * Create a mock user object
 */
export function createMockUser(overrides?: Partial<any>) {
  return {
    _id: fc.sample(arbitraries.userId(), 1)[0],
    clerkId: fc.sample(arbitraries.userId(), 1)[0],
    username: fc.sample(arbitraries.username(), 1)[0],
    email: fc.sample(arbitraries.email(), 1)[0],
    firstName: "Test",
    lastName: "User",
    profileImage: fc.sample(arbitraries.imageUrl(), 1)[0],
    bio: fc.sample(arbitraries.bio(), 1)[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock post object
 */
export function createMockPost(overrides?: Partial<any>) {
  return {
    _id: fc.sample(arbitraries.userId(), 1)[0],
    userId: fc.sample(arbitraries.userId(), 1)[0],
    author: createMockUser(),
    text: fc.sample(arbitraries.postText(), 1)[0],
    media: [
      {
        url: fc.sample(arbitraries.imageUrl(), 1)[0],
        type: "image",
      },
    ],
    reactionsCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock notification object
 */
export function createMockNotification(overrides?: Partial<any>) {
  return {
    _id: fc.sample(arbitraries.userId(), 1)[0],
    userId: fc.sample(arbitraries.userId(), 1)[0],
    type: "follow",
    actorId: fc.sample(arbitraries.userId(), 1)[0],
    actor: createMockUser(),
    message: "followed you",
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Suppress console errors during tests (useful for testing error boundaries)
 */
export function suppressConsoleError() {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });
}
