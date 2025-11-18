import dotenv from "dotenv";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { requestInfo } from "./middleware/requestInfo";
import { initSentry } from "./config/sentry";
import { applySecurityMiddleware } from "./config/security";
import { applyRateLimiting } from "./config/rate-limits";
import logger, { stream } from "./config/logger";
import { routes } from "./routes";
import { installResponseExtensions } from "./utils/response/responseExtensions";
import { config, validateConfig, isTest } from "./config/environment";

dotenv.config();

// Validate configuration on startup
try {
  validateConfig();
} catch (error) {
  console.error("❌ Configuration validation failed:");
  console.error(error);
  if (error instanceof Error) {
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
  }
  process.exit(1);
}

const app = express();

installResponseExtensions();

initSentry();
applySecurityMiddleware(app);
app.use(compression() as any);
app.use(morgan("combined", { stream }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
applyRateLimiting(app);
app.use(requestInfo);

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

if (!isTest) {
  app.listen(config.PORT, () => {
    logger.info(`🚀 Server is running on port ${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`🔗 API Endpoint: http://localhost:${config.PORT}/api/v1`);
  });
}

export default app;
