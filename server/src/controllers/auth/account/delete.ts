import { Request, Response } from "express";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { verifyOTP as compareOTP, isOTPExpired } from "../../otp/utils";
import logger from "../../../config/logger";
import { asyncHandler } from "../../../utils/response";
import { z } from "zod";

const softDeleteSchema = z.object({
  phone: z.string().trim().min(1, "Phone number is required"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

const GET_ACCOUNT_BY_PHONE = `
  query GetAccountByPhone($phone: String!) {
    user_account(where: { phone: { _eq: $phone } }) {
      id
      phone
      is_active
      deleted_at
      role
    }
  }
`;

const GET_OTP_FOR_DELETE_ACCOUNT = `
  query GetOTPForDeleteAccount($identifier: String!) {
    user_otp_transaction(
      where: {
        identifier: { _eq: $identifier }
        purpose: { _eq: "DELETE_ACCOUNT" }
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

const VERIFY_OTP_MUTATION = `
  mutation VerifyOTP($id: uuid!) {
    update_user_otp_transaction_by_pk(
      pk_columns: { id: $id }
      _set: { verified: true, verified_at: "now()" }
    ) {
      id
      verified
    }
  }
`;

const SOFT_DELETE_MUTATION = `
  mutation SoftDeleteUserAccount($userId: uuid!) {
    update_user_account_by_pk(
      pk_columns: { id: $userId }
      _set: { is_active: false, deleted_at: "now()" }
    ) {
      id
      is_active
      deleted_at
    }
  }
`;

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
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

    const parsed = softDeleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return res.error(
        parsed.error.issues[0]?.message || "Invalid input",
        400,
        "VALIDATION_ERROR",
        parsed.error.issues,
        "ACTION_ERROR"
      );
    }

    const { phone, otp } = parsed.data;
    const graphqlClient = getGraphQLClient();

    // 1. Check if account exists and is active
    const accountResult = await graphqlClient.request<{
      user_account: Array<{
        id: string;
        phone: string;
        is_active: boolean;
        deleted_at: string | null;
        role: string;
      }>;
    }>(GET_ACCOUNT_BY_PHONE, { phone });

    const account = accountResult.user_account[0];

    if (!account) {
      logger.warn("Account not found for deletion", { phone });
      return res.error(
        "Account not found",
        404,
        "ACCOUNT_NOT_FOUND",
        null,
        "ACTION_ERROR"
      );
    }

    if (!account.is_active || account.deleted_at) {
      logger.warn("Account already deleted or inactive", { phone });
      return res.error(
        "Account is already deleted or inactive",
        400,
        "ACCOUNT_ALREADY_DELETED",
        null,
        "ACTION_ERROR"
      );
    }

    // 2. Get and verify OTP
    const otpResult = await graphqlClient.request<{
      user_otp_transaction: Array<{
        id: string;
        otp_hash: string;
        attempts: number;
        expires_at: string;
        verified: boolean;
      }>;
    }>(GET_OTP_FOR_DELETE_ACCOUNT, { identifier: phone });

    const otpRecord = otpResult.user_otp_transaction[0];

    if (!otpRecord) {
      logger.warn("No valid OTP found for account deletion", { phone });
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
      logger.warn("OTP expired for account deletion", { phone });
      return res.error(
        "OTP has expired",
        400,
        "OTP_EXPIRED",
        null,
        "ACTION_ERROR"
      );
    }

    // Check max attempts
    const MAX_ATTEMPTS = 5;
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      logger.warn("Max OTP attempts exceeded for account deletion", { phone });
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

      logger.warn("Invalid OTP for account deletion", {
        phone,
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

    // 3. Mark OTP as verified
    await graphqlClient.request(VERIFY_OTP_MUTATION, { id: otpRecord.id });

    // 4. Soft delete the account
    const deleteResult = await graphqlClient.request<{
      update_user_account_by_pk: {
        id: string;
        is_active: boolean;
        deleted_at: string;
      };
    }>(SOFT_DELETE_MUTATION, { userId: account.id });

    logger.info("Account soft deleted successfully", {
      userId: account.id,
      phone,
    });

    res.success(
      "Account scheduled for deletion. You have 30 days to restore it by logging in.",
      {
        userId: account.id,
        deletedAt: deleteResult.update_user_account_by_pk.deleted_at,
      }
    );
  }
);
