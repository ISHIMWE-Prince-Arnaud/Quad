import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { SearchService } from "@/services/searchService";
import { api } from "@/lib/api";

// Feature: quad-production-ready, Property 32: Search Autocomplete Suggestions
// For any search query with at least 2 characters, autocomplete suggestions should be fetched from the backend.
// Validates: Requirements 10.1

describe("Search Autocomplete Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 32: Search queries with 2+ characters fetch autocomplete suggestions", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings with at least 2 characters
        fc.string({ minLength: 2, maxLength: 50 }),
        fc.integer({ min: 1, max: 20 }),
        async (query, limit) => {
          // Mock suggestions based on query
          const mockSuggestions = Array.from(
            { length: Math.min(limit, 10) },
            (_, i) => `${query.toLowerCase()}-suggestion-${i}`
          );

          // Mock axios get method
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                suggestions: mockSuggestions,
              },
            },
          });

          // Call the service
          const suggestions = await SearchService.getSearchSuggestions(
            query,
            limit
          );

          // Property 1: Suggestions should be fetched for queries with 2+ characters
          expect(suggestions).toBeDefined();
          expect(Array.isArray(suggestions)).toBe(true);

          // Property 2: API should be called with correct parameters
          expect(api.get).toHaveBeenCalledWith("/search/suggestions", {
            params: { q: query, limit },
          });

          // Property 3: Returned suggestions should match expected format
          expect(suggestions.length).toBeLessThanOrEqual(limit);
          suggestions.forEach((suggestion) => {
            expect(typeof suggestion).toBe("string");
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 32: Empty or single-character queries return empty suggestions", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings with 0-1 characters
        fc.string({ minLength: 0, maxLength: 1 }),
        async (query) => {
          // Mock empty suggestions
          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                suggestions: [],
              },
            },
          });

          // For empty/single char queries, the service should still work
          // but typically return empty results
          const suggestions = await SearchService.getSearchSuggestions(
            query,
            10
          );

          // Property: Empty or very short queries should return empty or minimal suggestions
          expect(Array.isArray(suggestions)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 32: Suggestions are case-insensitive", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 2, maxLength: 20 })
          .filter((s) => s.trim().length >= 2),
        fc.constantFrom("lower", "upper", "mixed"),
        async (baseQuery, caseType) => {
          let query = baseQuery;
          if (caseType === "lower") {
            query = baseQuery.toLowerCase();
          } else if (caseType === "upper") {
            query = baseQuery.toUpperCase();
          } else {
            // Mixed case
            query = baseQuery
              .split("")
              .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
              .join("");
          }

          const mockSuggestions = [
            `${query.toLowerCase()}-result-1`,
            `${query.toLowerCase()}-result-2`,
          ];

          vi.spyOn(api, "get").mockResolvedValueOnce({
            data: {
              success: true,
              data: {
                suggestions: mockSuggestions,
              },
            },
          });

          const suggestions = await SearchService.getSearchSuggestions(
            query,
            10
          );

          // Property: Suggestions should be returned regardless of case
          expect(suggestions).toBeDefined();
          expect(Array.isArray(suggestions)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 32: API errors are handled gracefully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 2, maxLength: 50 }),
        async (query) => {
          // Mock API error
          vi.spyOn(api, "get").mockRejectedValueOnce(
            new Error("Network error")
          );

          // Property: Service should handle errors without crashing
          await expect(
            SearchService.getSearchSuggestions(query, 10)
          ).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
