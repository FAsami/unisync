import rateLimit from "express-rate-limit";
import { isTest } from "../environment";

/**
 * Per-IP brake on endpoints that check a password or an OTP. OTP rows also
 * carry their own attempt counter; this stops one client from cycling through
 * many phone numbers. Relies on `trust proxy` being set so req.ip is the real
 * client and not Fly's edge proxy.
 */
export const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  handler: (req, res) => {
    res.error(
      "Too many attempts, please try again later",
      429,
      "CREDENTIAL_RATE_LIMIT_EXCEEDED",
      { retryAfter: "15 minutes" }
    );
  },
});
