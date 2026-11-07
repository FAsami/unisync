import { Request, Response } from "express";
import { z } from "zod";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { checkAndConsumeOTP } from "../../otp/utils";
import { REVOKE_USER_SESSIONS } from "../gql/mutation";
import logger from "../../../config/logger";
import { asyncHandler } from "../../../utils/response";
import { flexibleOtpCodeSchema, phoneSchema } from "../../../schemas";

const softDeleteSchema = z.object({
  phone: phoneSchema,
  otp: flexibleOtpCodeSchema,
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
    const parsed = softDeleteSchema.safeParse(req.body ?? {});
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
      logger.warn("Account not found for deletion");
      return res.error(
        "Account not found",
        404,
        "ACCOUNT_NOT_FOUND",
        null,
        "ACTION_ERROR"
      );
    }

    if (!account.is_active || account.deleted_at) {
      return res.error(
        "Account is already deleted or inactive",
        400,
        "ACCOUNT_ALREADY_DELETED",
        null,
        "ACTION_ERROR"
      );
    }

    const otpCheck = await checkAndConsumeOTP({
      identifier: phone,
      purpose: "DELETE_ACCOUNT",
      otp,
    });

    if (!otpCheck.ok) {
      return res.error(
        otpCheck.message,
        400,
        otpCheck.code,
        otpCheck.attemptsRemaining !== undefined
          ? { attemptsRemaining: otpCheck.attemptsRemaining }
          : null,
        "ACTION_ERROR"
      );
    }

    const deleteResult = await graphqlClient.request<{
      update_user_account_by_pk: {
        id: string;
        is_active: boolean;
        deleted_at: string;
      };
    }>(SOFT_DELETE_MUTATION, { userId: account.id });

    // Sign the user out everywhere: otherwise existing refresh tokens keep a
    // "deleted" account usable indefinitely.
    await graphqlClient.request(REVOKE_USER_SESSIONS, { user_id: account.id });

    logger.info("Account soft deleted successfully", { userId: account.id });

    res.success(
      "Account scheduled for deletion. You have 30 days to restore it by logging in.",
      {
        userId: account.id,
        deletedAt: deleteResult.update_user_account_by_pk.deleted_at,
      }
    );
  }
);
