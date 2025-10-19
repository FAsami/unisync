/**
 * Verify OTP Controller
 * Handles OTP verification and returns authentication tokens
 */

import { Request, Response } from "express";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { ApiResponse } from "../../../utils/response/ApiResponse";
import {
  sanitizeIdentifier,
  isValidPurpose,
  isValidOTPFormat,
} from "../validators";
import { verifyOTP as verifyOTPUtil, isOTPExpired } from "../utils";
import { config } from "../../../config/environment";
import logger from "../../../config/logger";
import {
  GET_OTP_BY_IDENTIFIER_AND_PURPOSE,
  UPDATE_OTP_ATTEMPTS,
  VERIFY_OTP,
} from "../gql";

interface VerifyOTPInput {
  identifier: string;
  otp: string;
  purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET";
}

interface VerifyOTPOutput {
  success: boolean;
  message: string;
  verified: boolean;
  identifier?: string;
  purpose?: string;
}

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract input from Hasura action format
    const input: VerifyOTPInput = req.body.input;

    if (!input) {
      const errorResponse = ApiResponse.error(
        "Invalid request format",
        400,
        "INVALID_REQUEST",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    const { identifier, otp, purpose } = input;

    // Validate input
    if (!identifier || !otp || !purpose) {
      const errorResponse = ApiResponse.error(
        "Identifier, OTP, and purpose are required",
        400,
        "MISSING_FIELDS",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    // Validate purpose
    if (!isValidPurpose(purpose)) {
      const errorResponse = ApiResponse.error(
        "Invalid purpose. Must be LOGIN, SIGNUP, or PASSWORD_RESET",
        400,
        "INVALID_PURPOSE",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    // Validate OTP format
    if (!isValidOTPFormat(otp, config.OTP_LENGTH)) {
      const errorResponse = ApiResponse.error(
        `Invalid OTP format. Must be ${config.OTP_LENGTH} digits`,
        400,
        "INVALID_OTP_FORMAT",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    // Sanitize identifier
    const sanitizedIdentifier = sanitizeIdentifier(identifier);

    const graphqlClient = getGraphQLClient();

    // Get OTP record
    const otpResult = await graphqlClient.request<{
      user_otp_transaction: Array<{
        id: string;
        identifier: string;
        identifier_type: "EMAIL" | "PHONE";
        purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET";
        otp_hash: string;
        attempts: number;
        expires_at: string;
        verified: boolean;
      }>;
    }>(GET_OTP_BY_IDENTIFIER_AND_PURPOSE, {
      identifier: sanitizedIdentifier,
      purpose,
    });

    const otpRecords = otpResult.user_otp_transaction;

    if (!otpRecords || otpRecords.length === 0) {
      // OWASP recommendation: Use generic error message to prevent enumeration
      const errorResponse = ApiResponse.error(
        "Invalid or expired OTP",
        400,
        "INVALID_OTP",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    const otpRecord = otpRecords[0];

    // Check if OTP is already verified
    if (otpRecord.verified) {
      const errorResponse = ApiResponse.error(
        "OTP has already been used",
        400,
        "OTP_ALREADY_USED",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    // Check if OTP has expired
    if (isOTPExpired(new Date(otpRecord.expires_at))) {
      const errorResponse = ApiResponse.error(
        "OTP has expired. Please request a new one.",
        400,
        "OTP_EXPIRED",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    // Check if max attempts reached
    if (otpRecord.attempts >= config.OTP_MAX_ATTEMPTS) {
      const errorResponse = ApiResponse.error(
        "Maximum verification attempts reached. Please request a new OTP.",
        400,
        "MAX_ATTEMPTS_REACHED",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    // Verify OTP against hash
    const isValid = await verifyOTPUtil(otp, otpRecord.otp_hash);

    if (!isValid) {
      // Increment attempt counter
      const newAttempts = otpRecord.attempts + 1;
      await graphqlClient.request(UPDATE_OTP_ATTEMPTS, {
        id: otpRecord.id,
        attempts: newAttempts,
      });

      logger.warn("Invalid OTP attempt", {
        identifier: sanitizedIdentifier,
        purpose,
        attempts: newAttempts,
        maxAttempts: config.OTP_MAX_ATTEMPTS,
      });

      // OWASP recommendation: Generic error message
      const remainingAttempts = config.OTP_MAX_ATTEMPTS - newAttempts;
      const errorResponse = ApiResponse.error(
        remainingAttempts > 0
          ? `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
          : "Maximum verification attempts reached. Please request a new OTP.",
        400,
        "INVALID_OTP",
        req,
        {
          remainingAttempts,
        },
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    // Mark OTP as verified
    await graphqlClient.request(VERIFY_OTP, {
      id: otpRecord.id,
    });

    logger.info("OTP verified successfully", {
      identifier: sanitizedIdentifier,
      purpose,
      otpId: otpRecord.id,
    });

    // Return success response
    // Note: Token generation should be handled by the client based on this verification
    // The client can then call appropriate auth endpoints (login/signup) with the verified identifier
    const output: VerifyOTPOutput = {
      success: true,
      message: "OTP verified successfully",
      verified: true,
      identifier: sanitizedIdentifier,
      purpose,
    };

    const response = ApiResponse.success(
      output,
      "OTP verified successfully",
      200,
      req
    );
    res.status(response.statusCode).json(response.body);
  } catch (error) {
    logger.error("Error verifying OTP:", error);

    const errorResponse = ApiResponse.error(
      "Failed to verify OTP",
      500,
      "VERIFY_OTP_FAILED",
      req,
      error instanceof Error ? error.message : "Unknown error",
      "ACTION_ERROR"
    );

    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
};
