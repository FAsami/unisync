import { Request, Response, NextFunction } from "express";
import { AppError, ApiResponse } from "../utils";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let code: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }

  if (err.name === "ValidationError") {
    statusCode = 422;
    message = err.message;
    code = "VALIDATION_ERROR";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
    code = "INVALID_ID";
  }

  if (err.name === "MongoError" && (err as any).code === 11000) {
    statusCode = 409;
    message = "Resource already exists";
    code = "DUPLICATE_KEY";
  }

  const errorResponse = ApiResponse.error(
    message,
    statusCode,
    code,
    req,
    err.stack
  );

  if (req.startTime) {
    errorResponse.body.meta.duration = Date.now() - req.startTime;
  }

  res.status(errorResponse.statusCode).json(errorResponse.body);
};
