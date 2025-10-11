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
  windowMs: 1 * 1000,
  max: 100,
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
  app.use(generalLimiter);

  // Webhook needs separate, higher limit
  app.use("/api/v1/auth/webhook/authorize", webhookLimiter);

  // Auth endpoints (except webhook) get strict limit
  app.use("/api/v1/auth/guest-session", authLimiter);
  app.use("/api/v1/auth/refresh", authLimiter);

  // Future OTP routes
  // app.use("/api/v1/auth/otp", otpLimiter);

  // General API limit
  app.use("/api/v1", apiLimiter);
};
