import * as Sentry from "@sentry/node";

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    release: process.env.APP_VERSION || "1.0.0",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === "development",
    beforeSend(event, hint) {
      if (process.env.NODE_ENV === "test") {
        return null;
      }
      event.tags = {
        ...event.tags,
        service: "ping-class-server",
        version: process.env.npm_package_version || "1.0.0",
      };

      return event;
    },
    ignoreErrors: [
      "Network Error",
      "ECONNRESET",
      "ECONNREFUSED",
      /^Route .* not found$/,
    ],
  });
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext("error_context", context);
  }
  Sentry.captureException(error);
};

export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info"
) => {
  Sentry.captureMessage(message, level);
};

export const setUser = (user: {
  id: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

export default Sentry;
