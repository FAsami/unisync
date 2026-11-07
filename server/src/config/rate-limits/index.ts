import { Express } from "express";
export { generalLimiter } from "./general";
export { authLimiter } from "./auth";
export { webhookLimiter } from "./webhook";
export { apiLimiter } from "./api";
export { healthLimiter } from "./health";
export { credentialLimiter } from "./credential";
export { sendOTPLimit } from "./otp";

/**
 * App-wide setup. Route-specific limiters (credentialLimiter, sendOTPLimit) are
 * attached in src/routes so it is visible at the route which limits apply.
 */
export const applyRateLimiting = (app: Express) => {
  // Fly.io (and most PaaS) terminate TLS at one proxy hop. Without this every
  // request appears to come from the proxy's IP and per-IP limits become a
  // global limit, which is why the limiters were previously disabled.
  app.set("trust proxy", 1);
};
