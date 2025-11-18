import { Request, Response } from "express";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { sendOTPSchema } from "../../schemas";
import {
  generateOTP,
  hashOTP,
  getOTPExpiry,
  incrementRateLimit,
} from "./utils";
import { getSMSProvider } from "../../lib/providers/sms";
import logger from "../../config/logger";
import { INSERT_OTP, INVALIDATE_OLD_OTPS } from "./gql";
import { asyncHandler } from "../../utils/response";

export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const rawInput = req.body;
  console.log("[raw INput]", rawInput);

  if (!rawInput) {
    return res.error(
      "Invalid request format",
      400,
      "INVALID_REQUEST",
      null,
      "ACTION_ERROR"
    );
  }

  const parsed = sendOTPSchema.safeParse(rawInput);
  if (!parsed.success) {
    console.log(
      "[Validation Error]",
      JSON.stringify(parsed.error.issues, null, 2)
    );
    console.log("[Input Data]", JSON.stringify(rawInput, null, 2));
    return res.error(
      parsed.error.issues[0]?.message || "Invalid input",
      400,
      "VALIDATION_ERROR",
      parsed.error.issues,
      "ACTION_ERROR"
    );
  }

  const { identifier, identifierType, purpose } = parsed.data;

  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = getOTPExpiry();

  logger.info(`Generated OTP for ${identifierType}`, { identifier, purpose });

  const graphqlClient = getGraphQLClient();

  await graphqlClient.request(INVALIDATE_OLD_OTPS, { identifier, purpose });

  const insertResult = await graphqlClient.request<{
    insert_user_otp_transaction_one: {
      id: string;
      expires_at: string;
    };
  }>(INSERT_OTP, {
    otp: {
      identifier,
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
    if (identifierType === "PHONE") {
      const smsProvider = await getSMSProvider();
      await smsProvider.send(identifier, otp, purpose);
    }

    await incrementRateLimit(req);

    logger.info(`OTP sent successfully via ${identifierType}`, {
      identifier,
      purpose,
      otpId: otpRecord.id,
    });

    res.created("OTP created successfully", {
      message: `OTP sent successfully to ${identifierType.toLowerCase()}`,
      otpId: otpRecord.id,
      expiresAt: otpRecord.expires_at,
    });
  } catch (providerError) {
    logger.error(`Failed to send OTP via ${identifierType}`, {
      error: providerError,
      identifier,
    });

    return res.error(
      `Failed to send OTP via ${identifierType}`,
      500,
      "OTP_SEND_FAILED",
      providerError instanceof Error ? providerError.message : "Unknown error",
      "ACTION_ERROR"
    );
  }
});
