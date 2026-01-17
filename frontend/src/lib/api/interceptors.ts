import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { logError } from "../errorHandling";
import { generateCacheKey, requestCache } from "../requestCache";
import { rateLimitState } from "./rateLimitState";

async function getRuntimeClerkToken(): Promise<string | null> {
  try {
    const clerk = (window as unknown as { Clerk?: unknown }).Clerk as
      | {
          load?: () => Promise<void>;
          session?: { getToken?: () => Promise<string | null> } | null;
        }
      | undefined;

    if (!clerk) {
      return null;
    }

    if (typeof clerk.load === "function") {
      await clerk.load();
    }

    const token = await clerk.session?.getToken?.();
    return token || null;
  } catch {
    return null;
  }
}

type CachedResponseError = {
  config: InternalAxiosRequestConfig;
  response: AxiosResponse;
  isCache: true;
};

export function attachInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(
    async (config) => {
      if (rateLimitState.retryAfter && Date.now() < rateLimitState.retryAfter) {
        const waitTime = Math.ceil(
          (rateLimitState.retryAfter - Date.now()) / 1000
        );
        return Promise.reject(
          new Error(
            `Rate limited. Please wait ${waitTime} seconds before retrying.`
          )
        );
      }

      let token = localStorage.getItem("clerk-db-jwt");
      if (!token) {
        token = await getRuntimeClerkToken();
        if (token) {
          localStorage.setItem("clerk-db-jwt", token);
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const method = config.method?.toUpperCase() || "GET";
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const { getCSRFToken } = await import("../csrfProtection");
        const csrfToken = getCSRFToken();
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken;
        }
      }

      if (!config.headers["X-Retry-Count"]) {
        config.headers["X-Retry-Count"] = "0";
      }

      if (config.method?.toLowerCase() === "get") {
        const cacheKey = generateCacheKey(
          config.url || "",
          config.params as Record<string, unknown>
        );

        const skipCache = config.headers["X-Skip-Cache"] === "true";

        if (!skipCache) {
          const cached = requestCache.get<AxiosResponse>(cacheKey);
          if (cached) {
            return Promise.reject({
              config,
              response: cached,
              isCache: true,
            } satisfies CachedResponseError);
          }
        }
      }

      return config;
    },
    (error) => {
      logError(error, { component: "API", action: "request-interceptor" });
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      if (rateLimitState.retryAfter && Date.now() >= rateLimitState.retryAfter) {
        rateLimitState.retryAfter = null;
        rateLimitState.requestCount = 0;
      }

      const request = response?.request as XMLHttpRequest | undefined;
      void request;

      if (response.config.method?.toLowerCase() === "get") {
        const skipCache = response.config.headers["X-Skip-Cache"] === "true";
        if (!skipCache) {
          const cacheKey = generateCacheKey(
            response.config.url || "",
            response.config.params as Record<string, unknown>
          );

          let ttl = 5 * 60 * 1000;

          if (
            response.config.url?.includes("/profile/") ||
            response.config.url?.includes("/users/")
          ) {
            ttl = 10 * 60 * 1000;
          }

          if (
            response.config.url?.includes("/feed") ||
            response.config.url?.includes("/notifications")
          ) {
            ttl = 30 * 1000;
          }

          requestCache.set(cacheKey, response, ttl);
        }
      }

      return response;
    },
    async (error: AxiosError | CachedResponseError) => {
      if ("isCache" in error && error.isCache) {
        return Promise.resolve(error.response);
      }

      const axiosError = error as AxiosError;
      const originalRequest = axiosError.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        _retryCount?: number;
        _authRetry?: boolean;
      };

      if (axiosError.response?.status === 401) {
        if (originalRequest && !originalRequest._authRetry) {
          originalRequest._authRetry = true;

          const refreshed = await getRuntimeClerkToken();
          if (refreshed) {
            localStorage.setItem("clerk-db-jwt", refreshed);
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${refreshed}`;
            return api(originalRequest);
          }
        }

        localStorage.removeItem("clerk-db-jwt");

        logError(axiosError, {
          component: "API",
          action: "authentication-error",
        });

        return Promise.reject(axiosError);
      }

      if (axiosError.response?.status === 429) {
        const retryAfterHeader = axiosError.response.headers["retry-after"];
        const retryAfterSeconds = retryAfterHeader
          ? parseInt(retryAfterHeader, 10)
          : 60;
        const retryAfter = retryAfterSeconds * 1000;

        rateLimitState.retryAfter = Date.now() + retryAfter;

        const endpoint = originalRequest?.url || "unknown";
        const { rateLimitManager } = await import("../rateLimitHandler");
        rateLimitManager.recordRateLimit(endpoint, retryAfterSeconds);

        logError(axiosError, {
          component: "API",
          action: "rate-limit-error",
          metadata: { retryAfter, endpoint },
        });

        return Promise.reject(axiosError);
      }

      const shouldRetry =
        !axiosError.response ||
        (axiosError.response.status >= 500 && axiosError.response.status < 600);

      if (shouldRetry && originalRequest && !originalRequest._retry) {
        const retryCount = originalRequest._retryCount || 0;
        const maxRetries = 3;

        if (retryCount < maxRetries) {
          originalRequest._retry = true;
          originalRequest._retryCount = retryCount + 1;

          originalRequest.headers["X-Retry-Count"] = String(retryCount + 1);

          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);

          logError(axiosError, {
            component: "API",
            action: "retry-attempt",
            metadata: {
              retryCount: retryCount + 1,
              maxRetries,
              delay,
            },
          });

          await new Promise((resolve) => setTimeout(resolve, delay));

          return api(originalRequest);
        }
      }

      if (axiosError.response?.status && axiosError.response.status >= 500) {
        logError(axiosError, {
          component: "API",
          action: "server-error",
          metadata: {
            status: axiosError.response.status,
            url: originalRequest?.url,
          },
        });
      }

      if (!axiosError.response) {
        logError(axiosError, {
          component: "API",
          action: "network-error",
          metadata: {
            url: originalRequest?.url,
          },
        });
      }

      return Promise.reject(axiosError);
    }
  );
}
