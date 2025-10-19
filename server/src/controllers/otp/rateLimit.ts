import { Request, Response, NextFunction } from "express";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { config } from "../../config/environment";
import { ApiResponse } from "../../utils/response/ApiResponse";
import logger from "../../config/logger";
import {
  GET_RATE_LIMIT,
  GET_RATE_LIMIT_BY_IP,
  INSERT_RATE_LIMIT,
  INCREMENT_RATE_LIMIT,
} from "./gql";

interface RateLimitData {
  identifier: string;
  identifierType: string;
  actionType: ActionType;
  ipAddress: string;
  currentWindowRecord?: RateLimitRecord;
}

declare global {
  namespace Express {
    interface Request {
      rateLimitData?: RateLimitData;
    }
  }
}

type ActionType = "SEND" | "VERIFY";

interface RateLimitConfig {
  maxAttempts: number;
  maxAttemptsPerIP?: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIG: Record<ActionType, RateLimitConfig> = {
  SEND: {
    maxAttempts: config.OTP_SEND_LIMIT_PER_HOUR,
    maxAttemptsPerIP: config.OTP_SEND_LIMIT_PER_IP_PER_HOUR,
    windowMs: 60 * 60 * 1000,
  },
  VERIFY: {
    maxAttempts: config.OTP_VERIFY_LIMIT_PER_15MIN,
    windowMs: 15 * 60 * 1000,
  },
};

interface RateLimitRecord {
  id: string;
  identifier: string;
  action_type: ActionType;
  attempt_count: number;
  window_start: string;
  ip_address?: string;
  created_at: string;
}

const rateLimit = (actionType: ActionType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const identifier =
        req.body.input?.identifier || req.body.identifier || "";
      const identifierType =
        req.body.input?.identifierType || req.body.identifierType || "";
      const purpose = req.body.input?.purpose || req.body.purpose || "";

      // Extract IP address for rate limiting (more secure than client-provided sessionId)
      const ipAddress =
        req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
        (req.headers["x-real-ip"] as string) ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        (req.connection as any)?.socket?.remoteAddress ||
        "unknown";

      if (!ipAddress || ipAddress === "unknown") {
        logger.warn("Could not determine IP address for rate limiting", {
          headers: req.headers,
          connection: req.connection?.remoteAddress,
        });
      }

      if (!identifier) {
        const errorResponse = ApiResponse.error(
          "Identifier is required for rate limiting",
          400,
          "IDENTIFIER_REQUIRED",
          req,
          null,
          "ACTION_ERROR"
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
        return;
      }

      if (!identifierType) {
        const errorResponse = ApiResponse.error(
          "Identifier type is required for rate limiting",
          400,
          "IDENTIFIER_TYPE_REQUIRED",
          req,
          null,
          "ACTION_ERROR"
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
        return;
      }

      if (!purpose) {
        const errorResponse = ApiResponse.error(
          "Purpose is required for rate limiting",
          400,
          "PURPOSE_REQUIRED",
          req,
          null,
          "ACTION_ERROR"
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
        return;
      }

      const rateLimitConfig = RATE_LIMIT_CONFIG[actionType];
      const windowStart = new Date(Date.now() - rateLimitConfig.windowMs);

      const graphqlClient = getGraphQLClient();

      // Check 1: Identifier-based rate limit (prevent targeted DoS)
      const identifierResult = await graphqlClient.request<{
        user_otp_rate_limit: RateLimitRecord[];
      }>(GET_RATE_LIMIT, {
        identifier: identifier.toLowerCase(),
        action_type: actionType,
        window_start: windowStart.toISOString(),
      });

      const identifierRecords = identifierResult.user_otp_rate_limit || [];
      const identifierAttempts = identifierRecords.reduce(
        (sum, record) => sum + record.attempt_count,
        0
      );

      if (identifierAttempts >= rateLimitConfig.maxAttempts) {
        logger.warn(`Identifier rate limit exceeded for ${actionType}`, {
          identifier,
          attempts: identifierAttempts,
          maxAttempts: rateLimitConfig.maxAttempts,
        });

        const errorResponse = ApiResponse.error(
          `Too many ${actionType.toLowerCase()} attempts for this ${identifierType.toLowerCase()}. Please try again later.`,
          429,
          "IDENTIFIER_RATE_LIMIT_EXCEEDED",
          req,
          {
            currentAttempts: identifierAttempts,
            maxAttempts: rateLimitConfig.maxAttempts,
            windowMs: rateLimitConfig.windowMs,
          },
          "ACTION_ERROR"
        );

        res.status(errorResponse.statusCode).json(errorResponse.body);
        return;
      }

      // Check 2: IP-based rate limit (prevent spam from one IP)
      if (
        rateLimitConfig.maxAttemptsPerIP &&
        actionType === "SEND" &&
        ipAddress !== "unknown"
      ) {
        // Query rate limits by IP address (we'll need to add this query)
        const ipResult = await graphqlClient.request<{
          user_otp_rate_limit: RateLimitRecord[];
        }>(GET_RATE_LIMIT_BY_IP, {
          ip_address: ipAddress,
          action_type: actionType,
          window_start: windowStart.toISOString(),
        });

        const ipRecords = ipResult.user_otp_rate_limit || [];
        const ipAttempts = ipRecords.reduce(
          (sum, record) => sum + record.attempt_count,
          0
        );

        if (ipAttempts >= rateLimitConfig.maxAttemptsPerIP) {
          logger.warn(`IP rate limit exceeded for ${actionType}`, {
            ipAddress,
            attempts: ipAttempts,
            maxAttempts: rateLimitConfig.maxAttemptsPerIP,
          });

          const errorResponse = ApiResponse.error(
            `Too many ${actionType.toLowerCase()} attempts from your IP address. Please try again later.`,
            429,
            "IP_RATE_LIMIT_EXCEEDED",
            req,
            {
              currentAttempts: ipAttempts,
              maxAttempts: rateLimitConfig.maxAttemptsPerIP,
              windowMs: rateLimitConfig.windowMs,
            },
            "ACTION_ERROR"
          );

          res.status(errorResponse.statusCode).json(errorResponse.body);
          return;
        }
      }

      // Store rate limit data in request for later use (after successful send)
      req.rateLimitData = {
        identifier: identifier.toLowerCase(),
        identifierType,
        actionType,
        ipAddress,
        currentWindowRecord: identifierRecords.find((record) => {
          const recordWindowStart = new Date(record.window_start);
          const now = new Date();
          const diff = now.getTime() - recordWindowStart.getTime();
          return diff < rateLimitConfig.windowMs;
        }),
      };

      next();
    } catch (error) {
      logger.error(`Error checking rate limit for ${actionType}`, { error });

      const errorResponse = ApiResponse.error(
        "Service temporarily unavailable. Please try again later.",
        429,
        "RATE_LIMIT_CHECK_FAILED",
        req,
        null,
        "ACTION_ERROR"
      );

      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }
  };
};

// Utility function to increment rate limit after successful operation
export const incrementRateLimit = async (req: Request): Promise<void> => {
  if (!req.rateLimitData) {
    logger.warn("No rate limit data found in request");
    return;
  }

  const {
    identifier,
    identifierType,
    actionType,
    ipAddress,
    currentWindowRecord,
  } = req.rateLimitData;

  try {
    const graphqlClient = getGraphQLClient();

    if (currentWindowRecord) {
      await graphqlClient.request(INCREMENT_RATE_LIMIT, {
        id: currentWindowRecord.id,
        attempt_count: currentWindowRecord.attempt_count + 1,
      });
    } else {
      await graphqlClient.request(INSERT_RATE_LIMIT, {
        rate_limit: {
          identifier,
          action_type: actionType,
          identifier_type: identifierType,
          ip_address: ipAddress,
          attempt_count: 1,
          window_start: new Date().toISOString(),
        },
      });
    }

    logger.info("Rate limit incremented successfully", {
      identifier,
      actionType,
      ipAddress,
    });
  } catch (error) {
    logger.error("Failed to increment rate limit", {
      error,
      identifier,
      actionType,
    });
    // Don't throw - this shouldn't fail the main operation
  }
};

export const rateLimitOTP = {
  verifyOTPLimit: rateLimit("VERIFY"),
  sendOTPLimit: rateLimit("SEND"),
};
