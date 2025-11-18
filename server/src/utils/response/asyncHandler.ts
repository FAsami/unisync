/**
 * Async Handler - Wraps async route handlers to catch errors
 * No more try-catch needed in every controller!
 *
 * @example
 * router.post("/login", asyncHandler(login));
 */

import { Request, Response, NextFunction } from "express";
import { AsyncRequestHandler } from "../../types";

export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
