import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
    }
  }
}

export const requestInfo = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Ensure headers object exists
  if (!req.headers) {
    req.headers = {};
  }

  if (!req.headers["x-request-id"]) {
    req.headers["x-request-id"] = uuidv4();
  }

  req.requestId = req.headers["x-request-id"] as string;
  req.startTime = Date.now();

  res.setHeader("x-request-id", req.requestId);

  next();
};
