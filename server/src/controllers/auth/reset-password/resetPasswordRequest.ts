import { Request, Response } from "express";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { resetPasswordRequestSchema } from "../../../schemas";
import { GET_USER_BY_PHONE } from "../gql/queries";
import { generateOTP, hashOTP, getOTPExpiry } from "../../otp/utils";
import { INSERT_OTP } from "../../otp/gql";
import { asyncHandler } from "../../../utils/response";
import { ValidationError } from "../../../utils/errors";
import logger from "../../../config/logger";
import { getSMSProvider } from "@/lib/providers/sms";

export const resetPasswordRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = resetPasswordRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input");
    }

    const { phone } = parsed.data;
    const graphql = getGraphQLClient();

    const userRes = await graphql.request<{
      user_account: Array<{ id: string; phone_verified_at: string | null }>;
    }>(GET_USER_BY_PHONE, { phone });

    const user = userRes.user_account?.[0];

    if (!user || !user.phone_verified_at) {
      return res.message("If the phone exists, an OTP has been sent.");
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = getOTPExpiry().toISOString();

    try {
      await graphql.request(INSERT_OTP, {
        otp: {
          identifier: phone,
          identifier_type: "PHONE",
          purpose: "PASSWORD_RESET",
          otp_hash: otpHash,
          attempts: 0,
          expires_at: expiresAt,
          verified: false,
        },
      });

      logger.info("Password reset OTP created", { phone });

      const smsProvider = await getSMSProvider();
      console.log("smsProvider", smsProvider);
      await smsProvider.send(phone, otp, "PASSWORD_RESET");
    } catch (error) {
      // Intentionally log but still return generic success to avoid enumeration
      logger.error("Failed to create password reset OTP", { error, phone });
    }

    res.message("If the phone exists, an OTP has been sent.");
  }
);
