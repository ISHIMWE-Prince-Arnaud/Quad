import { requestCache } from "../requestCache";

export function invalidateCache(pattern?: string | RegExp) {
  if (!pattern) {
    requestCache.clear();
  } else if (typeof pattern === "string") {
    requestCache.invalidate(pattern);
  } else {
    requestCache.invalidatePattern(pattern);
  }
}
