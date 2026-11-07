import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { resetPasswordVerifySchema } from "../../../schemas";
import { GET_USER_BY_PHONE } from "../gql/queries";
import { checkAndConsumeOTP } from "../../otp/utils";
import { REVOKE_USER_SESSIONS, UPDATE_USER_PASSWORD } from "../gql/mutation";
import { asyncHandler } from "../../../utils/response";
import { ValidationError, BadRequestError } from "../../../utils/errors";

export const resetPasswordVerify = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = resetPasswordVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input");
    }

    const { phone, otp, newPassword } = parsed.data;
    const graphql = getGraphQLClient();

    const userRes = await graphql.request<{
      user_account: Array<{ id: string; phone_verified_at: string | null }>;
    }>(GET_USER_BY_PHONE, { phone });

    const user = userRes.user_account?.[0];
    if (!user || !user.phone_verified_at) {
      throw new BadRequestError("Invalid or expired OTP", "INVALID_OTP");
    }

    const otpCheck = await checkAndConsumeOTP({
      identifier: phone,
      purpose: "PASSWORD_RESET",
      otp,
    });
    if (!otpCheck.ok) {
      throw new BadRequestError(otpCheck.message, otpCheck.code, {
        attemptsRemaining: otpCheck.attemptsRemaining,
      });
    }

    // Update password
    const hashed = await bcrypt.hash(newPassword, 12);
    await graphql.request(UPDATE_USER_PASSWORD, {
      id: user.id,
      password: hashed,
    });

    // Revoke all existing sessions for security
    await graphql.request(REVOKE_USER_SESSIONS, { user_id: user.id });

    res.message(
      "Password has been reset successfully. Please log in with your new password."
    );
  }
);
