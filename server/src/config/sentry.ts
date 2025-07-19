import * as Sentry from "@sentry/node";

export const initSentry = () => {
  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    release: process.env.APP_VERSION || "1.0.0",
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Enable debug mode in development
    debug: process.env.NODE_ENV === "development",
    // Before sending event to Sentry
    beforeSend(event, hint) {
      // Don't send events in test environment
      if (process.env.NODE_ENV === "test") {
        return null;
      }

      // Add custom context
      event.tags = {
        ...event.tags,
        service: "ping-class-server",
        version: process.env.npm_package_version || "1.0.0",
      };

      return event;
    },
    // Configure which errors to ignore
    ignoreErrors: [
      // Ignore specific error types
      "Network Error",
      "ECONNRESET",
      "ECONNREFUSED",
      // Ignore 404 errors
      /^Route .* not found$/,
    ],
  });
};

// Helper function to capture errors
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext("error_context", context);
  }
  Sentry.captureException(error);
};

// Helper function to capture messages
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info"
) => {
  Sentry.captureMessage(message, level);
};

// Helper function to set user context
export const setUser = (user: {
  id: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

// Helper function to add breadcrumbs
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

export default Sentry;
