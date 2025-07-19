import { Request } from "express";

export interface RequestInfo {
  requestId: string;
  method: string;
  path: string;
  startTime: number;
  duration?: number;
}

export const getRequestInfo = (req: Request): RequestInfo => {
  const startTime = req.startTime || Date.now();
  const duration = req.startTime ? Date.now() - req.startTime : undefined;

  return {
    requestId:
      req.requestId || (req.headers["x-request-id"] as string) || "unknown",
    method: req.method,
    path: req.originalUrl,
    startTime,
    duration,
  };
};

export const calculateDuration = (req: Request): number | undefined => {
  if (!req.startTime) return undefined;
  return Date.now() - req.startTime;
};

export const formatDuration = (duration: number): string => {
  if (duration < 1000) {
    return `${duration}ms`;
  }
  return `${(duration / 1000).toFixed(2)}s`;
};
