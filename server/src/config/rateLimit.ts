import rateLimit from "express-rate-limit";
import { Express } from "express";

// General rate limiter for all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    });
  },
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
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

// API rate limiter for specific endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
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

// Health check rate limiter (more lenient)
export const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
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

// Apply rate limiting to the app
export const applyRateLimiting = (app: Express) => {
  // Apply general limiter to all routes
  app.use(generalLimiter);

  // Apply specific limiters to routes
  app.use("/api/v1/auth", authLimiter);
  app.use("/api/v1", apiLimiter);
  app.use("/health", healthLimiter);
};
