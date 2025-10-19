import dotenv from "dotenv";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { requestInfo } from "./middleware/requestInfo";
import { initSentry } from "./config/sentry";
import { applySecurityMiddleware } from "./config/security";
import { applyRateLimiting } from "./config/rateLimit";
import logger, { stream } from "./config/logger";
import { routes } from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9201;

initSentry();
applySecurityMiddleware(app);
applyRateLimiting(app);
app.use(compression() as any);
app.use(morgan("combined", { stream }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestInfo);

const docsPath = path.join(__dirname, "../../docs/.vitepress/dist");
app.use(
  "/docs",
  express.static(docsPath, {
    maxAge: "1d",
    etag: true,
    lastModified: true,
  })
);

app.get("/docs/*", (req, res) => {
  res.sendFile(path.join(docsPath, "index.html"));
});

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

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`🔗 API Endpoint: http://localhost:${PORT}/api/v1`);
  });
}

export default app;
