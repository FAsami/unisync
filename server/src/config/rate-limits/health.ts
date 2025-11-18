import rateLimit from "express-rate-limit";

export const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.error(
      "Too many health check requests, please try again later",
      429,
      "HEALTH_RATE_LIMIT_EXCEEDED",
      { retryAfter: "1 minute" }
    );
  },
});
