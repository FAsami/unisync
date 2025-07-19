import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorResponse = ApiResponse.error(
    `Route ${req.originalUrl} not found`,
    404,
    "NOT_FOUND",
    req
  );

  if (req.startTime) {
    errorResponse.body.meta.duration = Date.now() - req.startTime;
  }

  res.status(errorResponse.statusCode).json(errorResponse.body);
};
