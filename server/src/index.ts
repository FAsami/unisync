import dotenv from "dotenv";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { healthRouter } from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { requestInfo } from "./middleware/requestInfo";
import { initSentry } from "./config/sentry";
import { applySecurityMiddleware } from "./config/security";
import { applyRateLimiting } from "./config/rateLimit";
import logger, { stream } from "./config/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9201;

// Initialize Sentry for error monitoring
initSentry();

// Apply security middleware (Helmet, CORS, etc.)
applySecurityMiddleware(app);

// Apply rate limiting
applyRateLimiting(app);

// Compression middleware
app.use(compression() as any);

// Request logging with Morgan
app.use(morgan("combined", { stream }));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom request info middleware
app.use(requestInfo);

// API routes
app.use("/api/v1", healthRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Uncaught exception handler
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

export default app;
