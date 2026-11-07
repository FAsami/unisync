import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors";
import { ZodError } from "zod";
import logger from "../config/logger";
import { isDevelopment } from "../config/environment";
import { captureError } from "../config/sentry";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error("ERROR_HANDLER:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    statusCode: err instanceof HttpError ? err.statusCode : 500,
  });

  if (err instanceof HttpError) {
    res.error(err.message, err.statusCode, err.code, err.details, err.type);
    return;
  }

  if (err instanceof ZodError) {
    res.error("Validation failed", 400, "VALIDATION_ERROR", err.issues);
    return;
  }
  // Unexpected errors only: HttpError/ZodError above are expected outcomes.
  captureError(err, { path: req.path, method: req.method });

  res.error(
    "Internal Server Error",
    500,
    "INTERNAL_ERROR",
    isDevelopment ? err.stack : undefined
  );
};
