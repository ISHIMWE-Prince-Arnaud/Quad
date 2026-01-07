// Type declaration for optional Sentry module
declare module "@sentry/react" {
  export const init: (config: unknown) => void;
  export const browserTracingIntegration: () => unknown;
  export const replayIntegration: (config: unknown) => unknown;
  export const setUser: (user: unknown) => void;
  export const captureException: (error: unknown, context?: unknown) => void;
  export const captureMessage: (message: string, context?: unknown) => void;
  export const addBreadcrumb: (breadcrumb: unknown) => void;
  export const setContext: (name: string, context: unknown) => void;
}
