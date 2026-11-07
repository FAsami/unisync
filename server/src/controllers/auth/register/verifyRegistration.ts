import { Request, Response } from "express";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { verifyRegistrationSchema } from "../../../schemas";
import { UPDATE_USER_VERIFIED } from "../gql/mutation";
import { GET_USER_BY_PHONE } from "../gql/queries";
import { checkAndConsumeOTP } from "../../otp/utils";
import { issueSession } from "../session/issueSession";
import { asyncHandler } from "../../../utils/response";
import { ValidationError, BadRequestError } from "../../../utils/errors";
import { TokenPayload } from "../../../types";

export const verifyRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = verifyRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input");
    }

    const { phone, otp } = parsed.data;
    const graphqlClient = getGraphQLClient();

    const userRes = await graphqlClient.request<{
      user_account: Array<{
        id: string;
        phone_verified_at: string | null;
        is_active: boolean;
        role: string;
      }>;
    }>(GET_USER_BY_PHONE, { phone });

    const user = userRes.user_account?.[0];
    if (!user || !user.is_active) {
      throw new BadRequestError("Invalid or expired OTP", "INVALID_OTP");
    }

    if (user.phone_verified_at) {
      throw new BadRequestError("Phone already verified", "ALREADY_VERIFIED");
    }

    const otpCheck = await checkAndConsumeOTP({
      identifier: phone,
      purpose: "SIGNUP",
      otp,
    });
    if (!otpCheck.ok) {
      throw new BadRequestError(otpCheck.message, otpCheck.code, {
        attemptsRemaining: otpCheck.attemptsRemaining,
      });
    }

    const update = await graphqlClient.request<{
      update_user_account_by_pk: { id: string };
    }>(UPDATE_USER_VERIFIED, {
      id: user.id,
    });

    const { result: sessionResult } = await issueSession(req, {
      userId: update.update_user_account_by_pk.id,
      role: user.role as TokenPayload["role"],
    });

    res.success("Registration verified successfully", sessionResult);
  }
);
