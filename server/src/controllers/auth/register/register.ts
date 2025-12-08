import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { registerSchema } from "../../../schemas";
import { INSERT_USER } from "../gql/mutation";
import { asyncHandler } from "../../../utils/response";
import { ConflictError, ValidationError } from "../../../utils/errors";
import { GET_USER_BY_PHONE } from "../gql/queries";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    const formatted = z.treeifyError(parsed.error);
    const fieldErrors = Object.fromEntries(
      Object.entries(formatted.properties ?? {}).map(([key, val]: any) => [
        key,
        val?.errors ?? [],
      ])
    );
    throw new ValidationError("Invalid input", fieldErrors);
  }

  const { phone, password, email } = parsed.data;

  const passwordHash = await bcrypt.hash(password, 12);

  const graphql = getGraphQLClient();
  const user = await graphql.request<{ user_account: Array<{ id: string }> }>(
    GET_USER_BY_PHONE,
    {
      phone: phone,
    }
  );
  if (user.user_account?.length > 0) {
    throw new ConflictError("Phone already registered");
  }
  const result = await graphql.request<{
    insert_user_account_one: { id: string };
  }>(INSERT_USER, {
    object: {
      phone: phone,
      email: email ?? null,
      password: passwordHash,
      role: "consumer",
      is_active: true,
    },
  });

  if (!result.insert_user_account_one) {
    throw new Error("Failed to create account");
  }

  res.created("Registration initiated. Please verify OTP.", {
    userId: result.insert_user_account_one.id,
  });
});
