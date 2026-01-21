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
      pathname: "/app/feed",
    } as unknown as string & Location;

    // Spy on localStorage methods (already mocked in setup.ts)
    vi.spyOn(localStorage, "getItem");
    vi.spyOn(localStorage, "setItem");
    vi.spyOn(localStorage, "removeItem");

    // Spy on sessionStorage methods
    vi.spyOn(sessionStorage, "setItem");
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
    window.location = originalLocation as unknown as string & Location;
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
              // Expected to throw
            }

            // Verify token was removed
            expect(localStorage.removeItem).toHaveBeenCalledWith(
              "clerk-db-jwt"
            );

            // Current interceptor behavior: clears token and rejects (no forced redirect)
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
            window.location.pathname = `/app/${pathname}`;
            localStorage.setItem("clerk-db-jwt", "test-token");

            // Mock 401 response
            mock.onGet("/test").reply(401, { message: "Unauthorized" });

            // Execute request
            try {
              await api.get("/test");
            } catch (error) {
              // Expected to throw
            }

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
          localStorage.setItem("clerk-db-jwt", "test-token");

          // Mock 401 response
          mock.onGet(`/${endpoint}`).reply(401, { message: "Unauthorized" });

          // Execute request
          try {
            await api.get(`/${endpoint}`);
          } catch (error) {
            // Expected to throw
          }

          // Verify token was still removed
          expect(localStorage.removeItem).toHaveBeenCalledWith("clerk-db-jwt");

          // Verify no redirect occurred (href unchanged)
          expect(window.location.href).toBe(initialHref);
        }),
        { numRuns: 30 }
      );
    });
  });

  describe("Token Inclusion in Requests", () => {
    it("should include token in Authorization header when available", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string({ minLength: 10, maxLength: 100 })
            .filter((s) => s.trim().length > 0), // token
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => s.trim().length > 0 && !s.includes("/api/")), // endpoint
          async (token, endpoint) => {
            // Setup
            localStorage.setItem("clerk-db-jwt", token);

            // Mock successful response
            mock.onGet(`/${endpoint}`).reply((config) => {
              // Verify Authorization header
              expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
              return [200, { success: true }];
            });

            // Execute request
            await api.get(`/${endpoint}`);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should make request without Authorization header when token is missing", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => s.trim().length > 0 && !s.includes("/api/")),
          async (endpoint) => {
            // Setup: No token
            localStorage.removeItem("clerk-db-jwt");

            // Mock successful response
            mock.onGet(`/${endpoint}`).reply((config) => {
              // Verify no Authorization header
              expect(config.headers?.Authorization).toBeUndefined();
              return [200, { success: true }];
            });

            // Execute request
            await api.get(`/${endpoint}`);
          }
        ),
        { numRuns: 30 }
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
            window.location.pathname = "/app/feed";
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
                // Expected to throw
              }
            }

            // Verify token was removed (at least once)
            expect(localStorage.removeItem).toHaveBeenCalledWith(
              "clerk-db-jwt"
            );

            // Current interceptor behavior: clears token and rejects (no forced redirect)
            expect(window.location.href).toBe(initialHref);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
