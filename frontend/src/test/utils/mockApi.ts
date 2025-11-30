// Mock API utilities for testing
import MockAdapter from "axios-mock-adapter";
import { api } from "@/lib/api";

/**
 * Create a mock adapter for axios
 */
export function createMockApi() {
  return new MockAdapter(api, { delayResponse: 0 });
}

/**
 * Mock successful API responses
 */
export const mockApiResponses = {
  success: (data: any) => ({
    success: true,
    data,
  }),

  error: (message: string, statusCode: number = 400) => ({
    success: false,
    message,
    statusCode,
  }),

  paginated: (
    data: any[],
    cursor: string | null = null,
    hasMore: boolean = false
  ) => ({
    success: true,
    data,
    pagination: {
      cursor,
      hasMore,
      total: data.length,
    },
  }),
};

/**
 * Common mock endpoints
 */
export function setupCommonMocks(mock: MockAdapter) {
  // Auth endpoints
  mock
    .onPost("/auth/sync")
    .reply(200, mockApiResponses.success({ synced: true }));

  // Health check
  mock.onGet("/health").reply(200, { status: "ok" });

  return mock;
}

/**
 * Reset all mocks
 */
export function resetMocks(mock: MockAdapter) {
  mock.reset();
  setupCommonMocks(mock);
}
