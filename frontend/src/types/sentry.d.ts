// Type declaration for optional Sentry module
declare module "@sentry/react" {
  export const init: (config: any) => void;
  export const browserTracingIntegration: () => any;
  export const replayIntegration: (config: any) => any;
  export const setUser: (user: any) => void;
  export const captureException: (error: any, context?: any) => void;
  export const captureMessage: (message: string, context?: any) => void;
  export const addBreadcrumb: (breadcrumb: any) => void;
  export const setContext: (name: string, context: any) => void;
}
