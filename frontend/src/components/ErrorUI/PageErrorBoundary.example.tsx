/**
 * PageErrorBoundary Usage Examples
 * 
 * This file demonstrates how to use the PageErrorBoundary component
 * in different scenarios across the application.
 */

import { PageErrorBoundary } from "./PageErrorBoundary";

/**
 * Example 1: Basic page-level error boundary
 * Wraps entire page content with default error type
 */
export function HomePageExample() {
  return (
    <PageErrorBoundary>
      <div>
        <h1>Home Page</h1>
        {/* Page content that might throw errors */}
      </div>
    </PageErrorBoundary>
  );
}

/**
 * Example 2: Page with network error type
 * Useful for pages that primarily load data from network
 */
export function ChatPageExample() {
  return (
    <PageErrorBoundary errorType="network">
      <div>
        <h1>Chat Page</h1>
        {/* Chat content that depends on network */}
      </div>
    </PageErrorBoundary>
  );
}

/**
 * Example 3: Page with data-load error type
 * Useful for pages that load data from various sources
 */
export function ProfilePageExample() {
  return (
    <PageErrorBoundary errorType="data-load">
      <div>
        <h1>Profile Page</h1>
        {/* Profile content that loads user data */}
      </div>
    </PageErrorBoundary>
  );
}

/**
 * Example 4: Page with authentication error type
 * Useful for protected pages that require authentication
 */
export function SettingsPageExample() {
  return (
    <PageErrorBoundary errorType="auth">
      <div>
        <h1>Settings Page</h1>
        {/* Settings content that requires authentication */}
      </div>
    </PageErrorBoundary>
  );
}

/**
 * Example 5: Nested error boundaries
 * Page-level boundary catches page errors, component-level catches component errors
 */
export function ComplexPageExample() {
  return (
    <PageErrorBoundary errorType="unknown">
      <div>
        <h1>Complex Page</h1>
        <div>
          {/* Main content */}
        </div>
      </div>
    </PageErrorBoundary>
  );
}

/**
 * Example 6: Integration with React Router
 * Wrap route components with PageErrorBoundary
 */
export function RouterIntegrationExample() {
  return (
    <>
      {/* In your router configuration: */}
      {/* 
      <Route 
        path="/home" 
        element={
          <PageErrorBoundary errorType="network">
            <HomePage />
          </PageErrorBoundary>
        } 
      />
      */}
    </>
  );
}
