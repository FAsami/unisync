import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { config } from "../config/environment";
import logger from "../config/logger";

export const SERVER_SECRET_HEADER = "server-auth-secret";

const safeEqual = (a: string, b: string): boolean => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

/**
 * Guards endpoints that only Hasura (actions / event triggers) or other trusted
 * backends may call. Hasura sends the `SERVER-AUTH-SECRET` header configured in
 * hasura/metadata (value_from_env: SERVER_AUTH_SECRET).
 *
 * Fails closed: if the server has no secret configured, every call is refused.
 */
export const requireServerSecret = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const expected = config.SERVER_AUTH_SECRET;
  if (!expected) {
    logger.error(
      `SERVER_AUTH_SECRET is not configured; refusing ${req.method} ${req.originalUrl}`
    );
    return res.error(
      "Server authentication is not configured",
      503,
      "SERVER_AUTH_NOT_CONFIGURED"
    );
  }

  const provided = req.header(SERVER_SECRET_HEADER);
  if (!provided || !safeEqual(provided, expected)) {
    logger.warn(`Rejected call without valid server secret`, {
      path: req.originalUrl,
      ip: req.ip,
    });
    return res.error("Unauthorized", 401, "INVALID_SERVER_SECRET");
  }

  return next();
};
