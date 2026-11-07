import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request } from "express";
import { config } from "../../config/environment";
import { getGraphQLClient } from "../../lib/graphqlClient";
import logger from "../../config/logger";

/**
 * Generate a random numeric OTP based on configured length
 * Uses crypto.randomInt for cryptographically secure random numbers (OWASP recommendation)
 */
export const generateOTP = (): string => {
  const length = config.OTP_LENGTH;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  // Use crypto.randomInt for secure random number generation
  const otp = crypto.randomInt(min, max + 1);
  return otp.toString().padStart(length, "0");
};

/**
 * Hash OTP using bcrypt with configured salt rounds
 * OWASP recommends bcrypt with at least 10 rounds (we use 12 by default)
 */
export const hashOTP = async (otp: string): Promise<string> => {
  const saltRounds = config.OTP_BCRYPT_ROUNDS;
  return await bcrypt.hash(otp, saltRounds);
};

/**
 * Verify OTP against stored hash
 * Uses constant-time comparison to prevent timing attacks (OWASP recommendation)
 */
export const verifyOTP = async (
  plainOTP: string,
  hashedOTP: string
): Promise<boolean> => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

/**
 * Calculate OTP expiry timestamp based on configured minutes
 */
export const getOTPExpiry = (): Date => {
  const expiryMinutes = config.OTP_EXPIRY_MINUTES;
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

/**
 * Check if OTP has expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};

/**
 * GraphQL queries for rate limit tracking
 */
const INSERT_RATE_LIMIT = `
  mutation InsertRateLimit($rate_limit: user_otp_rate_limit_insert_input!) {
    insert_user_otp_rate_limit_one(
      object: $rate_limit
      on_conflict: {
        constraint: otp_rate_limit_identifier_action_type_window_start_key
        update_columns: [attempt_count]
      }
    ) {
      id
      identifier
      action_type
      attempt_count
      window_start
      ip_address
    }
  }
`;

const INCREMENT_RATE_LIMIT = `
  mutation IncrementRateLimit($id: uuid!, $attempt_count: Int!) {
    update_user_otp_rate_limit_by_pk(
      pk_columns: { id: $id }
      _set: { attempt_count: $attempt_count }
    ) {
      id
      attempt_count
    }
  }
`;

/**
 * Increment rate limit after successful OTP send
 * This should be called after the OTP is successfully sent to track usage
 */
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
  }
};

/** Wrong guesses allowed per OTP before it is locked. */
export const MAX_OTP_ATTEMPTS = 5;

const GET_ACTIVE_OTP = `
  query GetActiveOTP($identifier: String!, $purpose: String!) {
    user_otp_transaction(
      where: {
        identifier: { _eq: $identifier }
        purpose: { _eq: $purpose }
        verified: { _eq: false }
        expires_at: { _gt: "now()" }
      }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      otp_hash
      attempts
      expires_at
      verified
    }
  }
`;

const SET_OTP_ATTEMPTS = `
  mutation SetOTPAttempts($id: uuid!, $attempts: Int!) {
    update_user_otp_transaction_by_pk(
      pk_columns: { id: $id }
      _set: { attempts: $attempts }
    ) {
      id
      attempts
    }
  }
`;

const MARK_OTP_VERIFIED = `
  mutation MarkOTPVerified($id: uuid!) {
    update_user_otp_transaction_by_pk(
      pk_columns: { id: $id }
      _set: { verified: true, verified_at: "now()" }
    ) {
      id
      verified
    }
  }
`;

export type OTPCheckFailure =
  | "INVALID_OTP"
  | "OTP_EXPIRED"
  | "MAX_ATTEMPTS_EXCEEDED";

export type OTPCheckResult =
  | { ok: true; otpId: string }
  | {
      ok: false;
      code: OTPCheckFailure;
      message: string;
      attemptsRemaining?: number;
    };

/**
 * The one place OTPs are checked. Finds the newest live OTP for
 * identifier+purpose, enforces expiry and MAX_OTP_ATTEMPTS, records wrong
 * guesses, and marks the OTP used on success so it cannot be replayed.
 *
 * Every endpoint that accepts an OTP must go through this; otherwise that
 * endpoint becomes an unlimited brute-force oracle for 6-digit codes.
 */
export const checkAndConsumeOTP = async (params: {
  identifier: string;
  purpose: string;
  otp: string;
}): Promise<OTPCheckResult> => {
  const { identifier, purpose, otp } = params;
  const graphqlClient = getGraphQLClient();

  const { user_otp_transaction } = await graphqlClient.request<{
    user_otp_transaction: Array<{
      id: string;
      otp_hash: string;
      attempts: number;
      expires_at: string;
      verified: boolean;
    }>;
  }>(GET_ACTIVE_OTP, { identifier, purpose });

  const record = user_otp_transaction?.[0];
  if (!record || record.verified) {
    return { ok: false, code: "INVALID_OTP", message: "Invalid or expired OTP" };
  }

  if (isOTPExpired(new Date(record.expires_at))) {
    return { ok: false, code: "OTP_EXPIRED", message: "OTP has expired" };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    return {
      ok: false,
      code: "MAX_ATTEMPTS_EXCEEDED",
      message: "Maximum verification attempts exceeded",
    };
  }

  const isValid = await verifyOTP(otp, record.otp_hash);
  if (!isValid) {
    const attempts = record.attempts + 1;
    await graphqlClient.request(SET_OTP_ATTEMPTS, { id: record.id, attempts });
    logger.warn("Invalid OTP provided", { purpose, attempts });
    return {
      ok: false,
      code: "INVALID_OTP",
      message: "Invalid OTP",
      attemptsRemaining: Math.max(0, MAX_OTP_ATTEMPTS - attempts),
    };
  }

  await graphqlClient.request(MARK_OTP_VERIFIED, { id: record.id });
  return { ok: true, otpId: record.id };
};
