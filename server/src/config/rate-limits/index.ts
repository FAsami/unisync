import { Express } from "express";
export { generalLimiter } from "./general";
export { authLimiter } from "./auth";
export { webhookLimiter } from "./webhook";
export { apiLimiter } from "./api";
export { healthLimiter } from "./health";

export { sendOTPLimit } from "./otp";

import { generalLimiter } from "./general";
import { authLimiter } from "./auth";
import { apiLimiter } from "./api";
import { sendOTPLimit } from "./otp";

export const applyRateLimiting = (app: Express) => {
  // app.use(generalLimiter);
  // app.use("/api/v1/auth/guest-session", authLimiter);
  // app.use("/api/v1/auth/refresh", authLimiter);
  // app.use("/api/v1/otp/send", sendOTPLimit);
  // app.use("/api/v1", apiLimiter);
};
