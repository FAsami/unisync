import rateLimit from "express-rate-limit";
import { Express } from "express";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later.",
      retryAfter: "15 minutes",
    });
  },
});

export const webhookLimiter = rateLimit({
  windowMs: 1 * 1000, // 1 second window
  max: 100, // 100 requests per second
  message: {
    error: "Too many webhook requests, please try again later.",
    retryAfter: "1 second",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many webhook requests, please try again later.",
      retryAfter: "1 second",
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: "Too many API requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many API requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    });
  },
});

export const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    error: "Too many health check requests, please try again later.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many health check requests, please try again later.",
      retryAfter: "1 minute",
    });
  },
});

export const applyRateLimiting = (app: Express) => {
  // app.use(generalLimiter);
  // app.use("/api/v1/auth/webhook/authorize", webhookLimiter);
  // app.use("/api/v1/auth", authLimiter);
  // app.use("/api/v1", apiLimiter);
  // app.use("/health", healthLimiter);
};
