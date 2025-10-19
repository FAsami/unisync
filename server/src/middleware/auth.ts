import { Request, Response, NextFunction } from "express";
import { JWTService, DecodedToken } from "../utils/jwt";
import { ApiResponse } from "../utils/response/ApiResponse";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export interface AuthOptions {
  requireAuth?: boolean;
  allowGuest?: boolean;
  requireUser?: boolean;
}

export const authenticate = (options: AuthOptions = {}) => {
  const {
    requireAuth = true,
    allowGuest = true,
    requireUser = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        if (!requireAuth) {
          return next();
        }

        return res
          .status(401)
          .json(
            ApiResponse.error(
              "Authorization header required",
              401,
              "MISSING_AUTH_HEADER",
              req
            ).body
          );
      }

      if (!authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json(
            ApiResponse.error(
              "Invalid authorization header format",
              401,
              "INVALID_AUTH_HEADER",
              req
            ).body
          );
      }

      const token = authHeader.replace("Bearer ", "");

      if (!token) {
        return res
          .status(401)
          .json(
            ApiResponse.error(
              "Invalid authorization header format",
              401,
              "INVALID_AUTH_HEADER",
              req
            ).body
          );
      }

      const decoded = JWTService.verifyAccessToken(token);
      if (JWTService.isTokenExpired(token)) {
        return res
          .status(401)
          .json(
            ApiResponse.error("Token has expired", 401, "TOKEN_EXPIRED", req)
              .body
          );
      }

      if (requireUser && decoded.role === "guest-consumer") {
        return res
          .status(403)
          .json(
            ApiResponse.error(
              "User authentication required",
              403,
              "USER_AUTH_REQUIRED",
              req
            ).body
          );
      }

      if (!allowGuest && decoded.role === "guest-consumer") {
        return res
          .status(403)
          .json(
            ApiResponse.error(
              "Guest access not allowed",
              403,
              "GUEST_ACCESS_DENIED",
              req
            ).body
          );
      }

      req.user = decoded;
      return next();
    } catch (error) {
      console.error("Authentication error:", error);

      return res
        .status(401)
        .json(
          ApiResponse.error(
            "Authentication failed",
            401,
            "AUTH_FAILED",
            req,
            error instanceof Error ? error.message : "Unknown error"
          ).body
        );
    }
  };
};

export const guestOnly = authenticate({
  requireAuth: true,
  allowGuest: true,
  requireUser: false,
});

export const userOnly = authenticate({
  requireAuth: true,
  allowGuest: false,
  requireUser: true,
});

/**
 * Middleware for optional authentication
 */
export const optionalAuth = authenticate({
  requireAuth: false,
  allowGuest: true,
  requireUser: false,
});

/**
 * Middleware to verify refresh token
 */
export const verifyRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            "Refresh token required",
            400,
            "MISSING_REFRESH_TOKEN",
            req
          ).body
        );
    }

    const decoded = JWTService.verifyRefreshToken(refresh_token);

    if (JWTService.isTokenExpired(refresh_token)) {
      return res
        .status(401)
        .json(
          ApiResponse.error(
            "Refresh token has expired",
            401,
            "REFRESH_TOKEN_EXPIRED",
            req
          ).body
        );
    }

    req.user = decoded;
    return next();
  } catch (error) {
    console.error("Refresh token verification error:", error);

    return res
      .status(401)
      .json(
        ApiResponse.error(
          "Invalid refresh token",
          401,
          "INVALID_REFRESH_TOKEN",
          req,
          error instanceof Error ? error.message : "Unknown error"
        ).body
      );
  }
};
