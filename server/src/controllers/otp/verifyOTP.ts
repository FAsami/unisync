import { Request, Response } from "express";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { verifyOTPSchema } from "../../schemas";
import { verifyOTP as compareOTP, isOTPExpired } from "./utils";
import logger from "../../config/logger";
import { GET_OTP_BY_IDENTIFIER_AND_PURPOSE, VERIFY_OTP } from "./gql";
import { asyncHandler } from "../../utils/response";

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const rawInput = req.body;

  if (!rawInput) {
    return res.error(
      "Invalid request format",
      400,
      "INVALID_REQUEST",
      null,
      "ACTION_ERROR"
    );
  }

  const parsed = verifyOTPSchema.safeParse(rawInput);
  if (!parsed.success) {
    return res.error(
      parsed.error.issues[0]?.message || "Invalid input",
      400,
      "VALIDATION_ERROR",
      parsed.error.issues,
      "ACTION_ERROR"
    );
  }

  const { identifier, otp, purpose } = parsed.data;

  const graphqlClient = getGraphQLClient();

  // Get the most recent unverified OTP for this identifier and purpose
  const otpResult = await graphqlClient.request<{
    user_otp_transaction: Array<{
      id: string;
      otp_hash: string;
      attempts: number;
      expires_at: string;
      verified: boolean;
    }>;
  }>(GET_OTP_BY_IDENTIFIER_AND_PURPOSE, { identifier, purpose });

  const otpRecord = otpResult.user_otp_transaction[0];

  if (!otpRecord) {
    logger.warn("No OTP found for verification", { identifier, purpose });
    return res.error(
      "Invalid or expired OTP",
      400,
      "INVALID_OTP",
      null,
      "ACTION_ERROR"
    );
  }

  // Check if OTP has expired
  if (isOTPExpired(new Date(otpRecord.expires_at))) {
    logger.warn("OTP has expired", { identifier, purpose });
    return res.error(
      "OTP has expired",
      400,
      "OTP_EXPIRED",
      null,
      "ACTION_ERROR"
    );
  }

  // Check if OTP has already been verified
  if (otpRecord.verified) {
    logger.warn("OTP already verified", { identifier, purpose });
    return res.error(
      "OTP has already been used",
      400,
      "OTP_ALREADY_USED",
      null,
      "ACTION_ERROR"
    );
  }

  // Check if max attempts exceeded (e.g., 5 attempts)
  const MAX_ATTEMPTS = 5;
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    logger.warn("Max OTP verification attempts exceeded", {
      identifier,
      purpose,
    });
    return res.error(
      "Maximum verification attempts exceeded",
      400,
      "MAX_ATTEMPTS_EXCEEDED",
      null,
      "ACTION_ERROR"
    );
  }

  // Verify the OTP
  const isValid = await compareOTP(otp, otpRecord.otp_hash);

  if (!isValid) {
    // Increment attempts
    await graphqlClient.request(
      `
      mutation UpdateOTPAttempts($id: uuid!, $attempts: Int!) {
        update_user_otp_transaction_by_pk(
          pk_columns: { id: $id }
          _set: { attempts: $attempts }
        ) {
          id
          attempts
        }
      }
    `,
      {
        id: otpRecord.id,
        attempts: otpRecord.attempts + 1,
      }
    );

    logger.warn("Invalid OTP provided", {
      identifier,
      purpose,
      attempts: otpRecord.attempts + 1,
    });

    return res.error(
      "Invalid OTP",
      400,
      "INVALID_OTP",
      {
        attemptsRemaining: MAX_ATTEMPTS - (otpRecord.attempts + 1),
      },
      "ACTION_ERROR"
    );
  }

  // Mark OTP as verified
  await graphqlClient.request(VERIFY_OTP, { id: otpRecord.id });

  logger.info("OTP verified successfully", { identifier, purpose });

  res.success("OTP verified successfully", {
    verified: true,
    otpId: otpRecord.id,
  });
});
