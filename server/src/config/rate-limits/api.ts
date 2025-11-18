import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.error(
      "Too many API requests from this IP, please try again later",
      429,
      "API_RATE_LIMIT_EXCEEDED",
      { retryAfter: "15 minutes" }
    );
  },
});
