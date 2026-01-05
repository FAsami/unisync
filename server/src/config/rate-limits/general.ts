import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === "/api/v1/auth/webhook/authorize";
  },
  handler: (req, res) => {
    res.error(
      "Too many requests from this IP, please try again later",
      429,
      "RATE_LIMIT_EXCEEDED",
      { retryAfter: "15 minutes" }
    );
  },
});
