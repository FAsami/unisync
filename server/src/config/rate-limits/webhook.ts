import rateLimit from "express-rate-limit";

export const webhookLimiter = rateLimit({
  windowMs: 1,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.error(
      "Too many webhook requests, please try again later",
      429,
      "WEBHOOK_RATE_LIMIT_EXCEEDED",
      { retryAfter: "1 second" }
    );
  },
});
