import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.error(
      "Too many authentication attempts, please try again later",
      429,
      "AUTH_RATE_LIMIT_EXCEEDED",
      { retryAfter: "15 minutes" }
    );
  },
});
