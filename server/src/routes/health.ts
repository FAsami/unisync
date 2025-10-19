import { Router, Request, Response } from "express";
import { ApiResponse } from "../utils";
import { captureError, captureMessage } from "../config/sentry";
import * as Sentry from "@sentry/node";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  const healthData: {
    status: string;
    uptime: number;
    environment: string;
    version: string;
  } = {
    status: "OK",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  };

  const response = ApiResponse.success(
    healthData,
    "Server is healthy",
    200,
    req
  );

  if (req.startTime) {
    response.body.meta.duration = Date.now() - req.startTime;
  }

  res.status(response.statusCode).json(response.body);
});

// Sentry test endpoints (only for development/testing)
router.get("/sentry-test/error", (req: Request, res: Response) => {
  try {
    throw new Error("This is a test error for Sentry");
  } catch (error) {
    captureError(error as Error, {
      testType: "manual-error",
      endpoint: "/sentry-test/error",
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message:
        "Test error captured and sent to Sentry. Check your Sentry dashboard.",
      eventId: Sentry.lastEventId(),
    });
  }
});

router.get("/sentry-test/message", (req: Request, res: Response) => {
  captureMessage("This is a test message for Sentry", "info");

  res.status(200).json({
    success: true,
    message: "Test message sent to Sentry. Check your Sentry dashboard.",
    eventId: Sentry.lastEventId(),
  });
});

router.get("/sentry-test/uncaught", (req: Request, res: Response) => {
  // This will throw an uncaught error that should be captured by Sentry
  throw new Error("This is an uncaught test error for Sentry");
});

export { router as healthRouter };
