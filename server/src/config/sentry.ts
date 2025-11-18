import * as Sentry from "@sentry/node";
import { config, isProduction, isDevelopment, isTest } from "./environment";

export const initSentry = () => {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
    release: config.APP_VERSION,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    debug: isDevelopment,
    integrations: [
      Sentry.contextLinesIntegration({ frameContextLines: 0 }),
      Sentry.requestDataIntegration(),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.graphqlIntegration(),
    ],
    beforeSend(event) {
      if (isTest || isDevelopment) {
        return null;
      }
      event.tags = {
        ...event.tags,
        service: "unisync",
        version: config.APP_VERSION,
      };

      return event;
    },
    ignoreErrors: [
      "Network Error",
      "ECONNRESET",
      "ECONNREFUSED",
      /^Route .* not found$/,
      /Missing parameter name/,
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
