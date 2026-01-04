import { Request, Response } from "express";
import crypto from "crypto";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { verifyRegistrationSchema } from "../../../schemas";
import { GET_OTP_BY_IDENTIFIER_AND_PURPOSE, VERIFY_OTP } from "../../otp/gql";
import { UPDATE_USER_VERIFIED, CREATE_SESSION } from "../gql/mutation";
import { GET_USER_BY_PHONE } from "../gql/queries";
import { JWTService } from "../../../utils/jwt";
import { verifyOTP as compareOTP } from "../../otp/utils";
import { asyncHandler } from "../../../utils/response";
import { ValidationError, BadRequestError } from "../../../utils/errors";
import { User_Session } from "../../../types";

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

    const otpResult = await graphqlClient.request<{
      user_otp_transaction: Array<{ id: string; otp_hash: string }>;
    }>(GET_OTP_BY_IDENTIFIER_AND_PURPOSE, {
      identifier: phone,
      purpose: "SIGNUP",
    });

    const record = otpResult.user_otp_transaction?.[0];
    if (!record) {
      throw new BadRequestError("Invalid or expired OTP", "INVALID_OTP");
    }

    const ok = await compareOTP(otp, record.otp_hash);
    if (!ok) {
      throw new BadRequestError("Invalid or expired OTP", "INVALID_OTP");
    }

    await graphqlClient.request(VERIFY_OTP, { id: record.id });

    const update = await graphqlClient.request<{
      update_user_account_by_pk: { id: string };
    }>(UPDATE_USER_VERIFIED, {
      id: user.id,
    });

    const payload = {
      sessionId: crypto.randomUUID(),
      userId: update.update_user_account_by_pk.id,
      role: user.role as
        | "student"
        | "teacher"
        | "admin"
        | "class_representative",
    };
    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken(payload);

    const accessExp = JWTService.getTokenExpiration(accessToken);
    const refreshExp = JWTService.getTokenExpiration(refreshToken);

    const sessionResult = await graphqlClient.request<{
      insert_user_session_one: User_Session;
    }>(CREATE_SESSION, {
      session: {
        user_id: payload.userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expires_at: accessExp?.toISOString(),
        refresh_token_expires_at: refreshExp?.toISOString(),
        revoked: false,
        ip_address: req.ip || "",
        user_agent: req.headers["user-agent"] || "",
        last_used_at: new Date().toISOString(),
      },
    });

    res.success("Registration verified successfully", sessionResult);
  }
);
