import { Express } from "express";

// Export memory-based rate limiters (express-rate-limit)
export { generalLimiter } from "./general";
export { authLimiter } from "./auth";
export { webhookLimiter } from "./webhook";
export { apiLimiter } from "./api";
export { healthLimiter } from "./health";

export { sendOTPLimit } from "./otp";

// Import for the apply function
import { generalLimiter } from "./general";
import { authLimiter } from "./auth";
import { webhookLimiter } from "./webhook";
import { apiLimiter } from "./api";
import { sendOTPLimit } from "./otp";

export const applyRateLimiting = (app: Express) => {
  app.use(generalLimiter);

  // Specific endpoint rate limits
  app.use("/api/v1/auth/webhook/authorize", webhookLimiter);
  app.use("/api/v1/auth/guest-session", authLimiter);
  app.use("/api/v1/auth/refresh", authLimiter);
  app.use("/api/v1/otp/send", sendOTPLimit);
  app.use("/api/v1", apiLimiter);
};
