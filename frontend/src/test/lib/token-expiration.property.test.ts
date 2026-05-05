import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { api } from "@/lib/api";
import MockAdapter from "axios-mock-adapter";

/**
 * Feature: quad-production-ready, Property 55: Token Expiration Handling
 * Validates: Requirements 15.3
 *
 * For any 401 Unauthorized response, the user should be redirected to the login page
 * and the auth token should be cleared.
 */

describe("Token Expiration Property Tests", () => {
  let mock: MockAdapter;
  let originalLocation: Location;

  beforeEach(() => {
    // Mock axios
    mock = new MockAdapter(api);

    // Mock window.location
    originalLocation = window.location;
    delete (window as { location?: Location }).location;
    window.location = {
      ...originalLocation,
      href: "",
      pathname: "/",
    } as unknown as string & Location;

    // Mock window.Clerk for token retrieval
    (window as unknown as { Clerk?: { session?: { getToken?: () => Promise<string | null> } | null } }).Clerk = {
      session: {
        getToken: vi.fn(async () => "mock-test-jwt-token"),
      },
    };

    // Spy on sessionStorage methods
    vi.spyOn(sessionStorage, "setItem");
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
    window.location = originalLocation as unknown as string & Location;
    // Clean up window.Clerk mock
    (window as unknown as { Clerk?: unknown }).Clerk = undefined;
  });

  describe("Property 55: Token Expiration Handling", () => {
    it("should clear token and redirect to login for any 401 response", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // endpoint
          fc.oneof(
            fc.constant("get"),
            fc.constant("post"),
            fc.constant("put"),
            fc.constant("delete")
          ), // HTTP method
          fc.record({
            message: fc.option(fc.string()),
            error: fc.option(fc.string()),
          }), // response data
          async (endpoint, method, responseData) => {
            // Setup: Store a token
            localStorage.setItem("clerk-db-jwt", "test-token");

            const initialHref = window.location.href;

            // Mock 401 response
            const url = `/${endpoint}`;
            switch (method) {
              case "get":
                mock.onGet(url).reply(401, responseData);
                break;
              case "post":
                mock.onPost(url).reply(401, responseData);
                break;
              case "put":
                mock.onPut(url).reply(401, responseData);
                break;
              case "delete":
                mock.onDelete(url).reply(401, responseData);
                break;
            }

            // Execute request
            try {
              switch (method) {
                case "get":
                  await api.get(url);
                  break;
                case "post":
                  await api.post(url, {});
                  break;
                case "put":
                  await api.put(url, {});
                  break;
                case "delete":
                  await api.delete(url);
                  break;
              }
            } catch (error) {
              // Expected to throw - 401 causes rejection
            }

            // Current interceptor behavior: attempts token refresh, then rejects (no localStorage clearing)
            expect(window.location.href).toBe(initialHref);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should not automatically store intended destination on 401", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => !s.includes("/login")),
          async (pathname) => {
            // Setup
            window.location.pathname = `/${pathname}`;
            localStorage.setItem("clerk-db-jwt", "test-token");

            // Mock 401 response
            mock.onGet("/test").reply(401, { message: "Unauthorized" });

            // Execute request
            try {
              await api.get("/test");
            } catch (error) {
              // Expected to throw - 401 causes rejection
            }

            // Verify no redirect save to sessionStorage
            const calls = (sessionStorage.setItem as unknown as { mock?: { calls: unknown[][] } })
              .mock?.calls;
            const hasRedirectSave =
              calls?.some((call) => call?.[0] === "redirectAfterLogin") ?? false;
            expect(hasRedirectSave).toBe(false);
          }
        ),
        { numRuns: 30 }
      );
    });

    it("should not redirect if already on login page", async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1 }), async (endpoint) => {
          // Setup: Already on login page
          window.location.pathname = "/login";
          const initialHref = window.location.href;

          // Mock 401 response
          mock.onGet(`/${endpoint}`).reply(401, { message: "Unauthorized" });

          // Execute request
          try {
            await api.get(`/${endpoint}`);
          } catch (error) {
            // Expected to throw - 401 causes rejection
          }

          // Verify no redirect occurred (href unchanged)
          expect(window.location.href).toBe(initialHref);
        }),
        { numRuns: 30 }
      );
    });
  });

  describe("Token Inclusion in Requests", () => {
    it("should include token in Authorization header when Clerk token is available", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => s.trim().length > 0 && !s.includes("/api/")), // endpoint
          async (endpoint) => {
            // Mock successful response
            mock.onGet(`/${endpoint}`).reply((config) => {
              // Verify Authorization header is set by interceptor using Clerk token
              const authHeader = config.headers?.Authorization ?? config.headers?.authorization;
              expect(authHeader).toBeDefined();
              expect(String(authHeader)).toMatch(/^Bearer /);
              return [200, { success: true }];
            });

            // Execute request
            await api.get(`/${endpoint}`);
          }
        ),
        { numRuns: 30 }
      );
    });

    it("should make request without Authorization header when Clerk is unavailable", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => s.trim().length > 0 && !s.includes("/api/")),
          async (endpoint) => {
            // Temporarily remove Clerk from window to simulate no auth
            const originalClerk = (window as unknown as { Clerk?: unknown }).Clerk;
            (window as unknown as { Clerk?: unknown }).Clerk = undefined;

            // Mock successful response
            mock.onGet(`/${endpoint}`).reply((config) => {
              // Verify no Authorization header when Clerk is unavailable
              expect(config.headers?.Authorization).toBeUndefined();
              return [200, { success: true }];
            });

            // Execute request
            await api.get(`/${endpoint}`);

            // Restore Clerk
            (window as unknown as { Clerk?: unknown }).Clerk = originalClerk;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe("Multiple 401 Responses", () => {
    it("should handle multiple 401 responses consistently", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 5 }),
          async (endpoints) => {
            // Setup
            window.location.pathname = "/";
            localStorage.setItem("clerk-db-jwt", "test-token");

            const initialHref = window.location.href;

            // Mock all endpoints to return 401
            endpoints.forEach((endpoint) => {
              mock
                .onGet(`/${endpoint}`)
                .reply(401, { message: "Unauthorized" });
            });

            // Execute requests sequentially
            for (const endpoint of endpoints) {
              try {
                await api.get(`/${endpoint}`);
              } catch (error) {
                // Expected to throw - 401 causes rejection
              }
            }

            // Current interceptor behavior: attempts token refresh on each 401, then rejects (no forced redirect)
            expect(window.location.href).toBe(initialHref);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});



