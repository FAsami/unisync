import { Request, Response } from "express";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { ApiResponse } from "../../../utils/response/ApiResponse";
import {
  validateIdentifier,
  sanitizeIdentifier,
  isValidPurpose,
} from "../validators";
import { generateOTP, hashOTP, getOTPExpiry } from "../utils";
import { getEmailProvider } from "../../../lib/providers/email";
import { getSMSProvider } from "../../../lib/providers/sms";
import logger from "../../../config/logger";
import { INSERT_OTP, INVALIDATE_OLD_OTPS } from "../gql";
import { incrementRateLimit } from "../rateLimit";

interface SendOTPInput {
  identifier: string;
  identifierType: "EMAIL" | "PHONE";
  purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET";
}

export const sendOTP = async (
  req: Request,
  res: Response
): Promise<ApiResponse> => {
  try {
    const input: SendOTPInput = req.body.input;

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

    const { identifier, identifierType, purpose } = input;

    if (!identifier || !identifierType || !purpose) {
      const errorResponse = ApiResponse.error(
        "Identifier, identifier type, and purpose are required",
        400,
        "MISSING_FIELDS",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

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

    const sanitizedIdentifier = sanitizeIdentifier(identifier);
    const validation = validateIdentifier(sanitizedIdentifier, identifierType);

    if (!validation.valid) {
      const errorResponse = ApiResponse.error(
        validation.error || "Invalid identifier",
        400,
        "INVALID_IDENTIFIER",
        req,
        null,
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    const otp = generateOTP();
    logger.info(`Generated OTP for ${identifierType}`, {
      identifier: sanitizedIdentifier,
      purpose,
    });

    const otpHash = await hashOTP(otp);
    const expiresAt = getOTPExpiry();

    const graphqlClient = getGraphQLClient();

    await graphqlClient.request(INVALIDATE_OLD_OTPS, {
      identifier: sanitizedIdentifier,
      purpose,
    });

    const insertResult = await graphqlClient.request<{
      insert_user_otp_transaction_one: {
        id: string;
        expires_at: string;
      };
    }>(INSERT_OTP, {
      otp: {
        identifier: sanitizedIdentifier,
        identifier_type: identifierType,
        purpose,
        otp_hash: otpHash,
        attempts: 0,
        expires_at: expiresAt.toISOString(),
        verified: false,
      },
    });

    const otpRecord = insertResult.insert_user_otp_transaction_one;

    if (!otpRecord) {
      throw new Error("Failed to create OTP record");
    }

    try {
      if (identifierType === "EMAIL") {
        const emailProvider = getEmailProvider();
        await emailProvider.send(sanitizedIdentifier, otp, purpose);
      } else if (identifierType === "PHONE") {
        const smsProvider = getSMSProvider();
        await smsProvider.send(sanitizedIdentifier, otp, purpose);
      }

      await incrementRateLimit(req);

      logger.info(`OTP sent successfully via ${identifierType}`, {
        identifier: sanitizedIdentifier,
        purpose,
        otpId: otpRecord.id,
      });
    } catch (providerError) {
      logger.error(`Failed to send OTP via ${identifierType}`, {
        error: providerError,
        identifier: sanitizedIdentifier,
      });

      const errorResponse = ApiResponse.error(
        `Failed to send OTP via ${identifierType}`,
        500,
        "OTP_SEND_FAILED",
        req,
        providerError instanceof Error
          ? providerError.message
          : "Unknown error",
        "ACTION_ERROR"
      );
      res.status(errorResponse.statusCode).json(errorResponse.body);
      return;
    }

    const result = ApiResponse.success(
      {
        message: `OTP sent successfully to ${identifierType.toLowerCase()}`,
        otpId: otpRecord.id,
        expiresAt: otpRecord.expires_at,
      },
      "OTP created successfully",
      201,
      req
    );

    res.status(result.statusCode).json(result.body);
  } catch (error) {
    logger.error("Error sending OTP:", error);

    const errorResponse = ApiResponse.error(
      "Failed to send OTP",
      500,
      "SEND_OTP_FAILED",
      req,
      error instanceof Error ? error.message : "Unknown error",
      "ACTION_ERROR"
    );

    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
};
