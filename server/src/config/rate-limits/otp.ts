import { Request, Response, NextFunction } from "express";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { config } from "../environment";
import logger from "../logger";
import { RateLimitConfig, RateLimitRecord } from "../../types";

const GET_RATE_LIMIT = `
  query GetRateLimit($identifier: String!, $action_type: String!, $window_start: timestamptz!) {
    user_otp_rate_limit(
      where: {
        identifier: { _eq: $identifier }
        action_type: { _eq: $action_type }
        window_start: { _gte: $window_start }
      }
    ) {
      id
      identifier
      action_type
      attempt_count
      window_start
      ip_address
      created_at
    }
  }
`;

const GET_RATE_LIMIT_BY_IP = `
  query GetRateLimitByIP($ip_address: String!, $action_type: String!, $window_start: timestamptz!) {
    user_otp_rate_limit(
      where: {
        ip_address: { _eq: $ip_address }
        action_type: { _eq: $action_type }
        window_start: { _gte: $window_start }
      }
    ) {
      id
      ip_address
      action_type
      attempt_count
      window_start
      created_at
    }
  }
`;

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxAttempts: config.OTP_SEND_LIMIT_PER_HOUR,
  maxAttemptsPerIP: config.OTP_SEND_LIMIT_PER_IP_PER_HOUR,
  windowMs: 60 * 60 * 1000,
};

export const sendOTPLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = (req.body || {}) as {
      input?: {
        identifier?: unknown;
        identifierType?: unknown;
        purpose?: unknown;
      };
      identifier?: unknown;
      identifierType?: unknown;
      purpose?: unknown;
    };

    const rawIdentifier =
      body.input?.identifier ?? body.identifier ?? req.query.identifier;
    const rawIdentifierType =
      body.input?.identifierType ??
      body.identifierType ??
      req.query.identifierType;
    const rawPurpose = body.input?.purpose ?? body.purpose ?? req.query.purpose;

    const identifier =
      typeof rawIdentifier === "string" ? rawIdentifier.trim() : "";
    const identifierType =
      typeof rawIdentifierType === "string"
        ? rawIdentifierType.trim().toUpperCase()
        : "";
    const purpose =
      typeof rawPurpose === "string" ? rawPurpose.trim().toUpperCase() : "";

    // Extract IP address for rate limiting
    const ipAddress =
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket?.remoteAddress ||
      "unknown";

    if (!ipAddress || ipAddress === "unknown") {
      logger.warn("Could not determine IP address for rate limiting", {
        headers: req.headers,
        socket: req.socket?.remoteAddress,
      });
    }

    if (!identifier) {
      return res.error(
        "Identifier is required for rate limiting",
        400,
        "IDENTIFIER_REQUIRED",
        null,
        "ACTION_ERROR"
      );
    }

    if (!identifierType) {
      return res.error(
        "Identifier type is required for rate limiting",
        400,
        "IDENTIFIER_TYPE_REQUIRED",
        null,
        "ACTION_ERROR"
      );
    }

    if (!purpose) {
      return res.error(
        "Purpose is required for rate limiting",
        400,
        "PURPOSE_REQUIRED",
        null,
        "ACTION_ERROR"
      );
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.windowMs);
    const graphqlClient = getGraphQLClient();

    // Check 1: Identifier-based rate limit (prevent targeted DoS)
    const identifierResult = await graphqlClient.request<{
      user_otp_rate_limit: RateLimitRecord[];
    }>(GET_RATE_LIMIT, {
      identifier: identifier.toLowerCase(),
      action_type: "SEND",
      window_start: windowStart.toISOString(),
    });

    const identifierRecords = identifierResult.user_otp_rate_limit || [];
    const identifierAttempts = identifierRecords.reduce(
      (sum, record) => sum + record.attempt_count,
      0
    );

    if (identifierAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      logger.warn("Identifier rate limit exceeded for OTP send", {
        identifier,
        attempts: identifierAttempts,
        maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      });

      return res.error(
        `Too many OTP send attempts for this ${identifierType.toLowerCase()}. Please try again later.`,
        429,
        "IDENTIFIER_RATE_LIMIT_EXCEEDED",
        {
          currentAttempts: identifierAttempts,
          maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
          windowMs: RATE_LIMIT_CONFIG.windowMs,
        },
        "ACTION_ERROR"
      );
    }

    // Check 2: IP-based rate limit (prevent spam from one IP)
    if (RATE_LIMIT_CONFIG.maxAttemptsPerIP && ipAddress !== "unknown") {
      const ipResult = await graphqlClient.request<{
        user_otp_rate_limit: RateLimitRecord[];
      }>(GET_RATE_LIMIT_BY_IP, {
        ip_address: ipAddress,
        action_type: "SEND",
        window_start: windowStart.toISOString(),
      });

      const ipRecords = ipResult.user_otp_rate_limit || [];
      const ipAttempts = ipRecords.reduce(
        (sum, record) => sum + record.attempt_count,
        0
      );

      if (ipAttempts >= RATE_LIMIT_CONFIG.maxAttemptsPerIP) {
        logger.warn("IP rate limit exceeded for OTP send", {
          ipAddress,
          attempts: ipAttempts,
          maxAttempts: RATE_LIMIT_CONFIG.maxAttemptsPerIP,
        });

        return res.error(
          "Too many OTP send attempts from your IP address. Please try again later.",
          429,
          "IP_RATE_LIMIT_EXCEEDED",
          {
            currentAttempts: ipAttempts,
            maxAttempts: RATE_LIMIT_CONFIG.maxAttemptsPerIP,
            windowMs: RATE_LIMIT_CONFIG.windowMs,
          },
          "ACTION_ERROR"
        );
      }
    }

    // Store rate limit data in request for later use
    req.rateLimitData = {
      identifier: identifier.toLowerCase(),
      identifierType,
      actionType: "SEND",
      ipAddress,
      currentWindowRecord: identifierRecords.find((record) => {
        const recordWindowStart = new Date(record.window_start);
        const now = new Date();
        const diff = now.getTime() - recordWindowStart.getTime();
        return diff < RATE_LIMIT_CONFIG.windowMs;
      }),
    };

    next();
  } catch (error) {
    logger.error("Error checking rate limit for OTP send", error);

    return res.error(
      "Service temporarily unavailable. Please try again later.",
      429,
      "RATE_LIMIT_CHECK_FAILED",
      null,
      "ACTION_ERROR"
    );
  }
};
