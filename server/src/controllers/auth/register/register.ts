import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { registerSchema } from "../../../schemas";
import { INSERT_USER } from "../gql/mutation";
import { asyncHandler } from "../../../utils/response";
import { ConflictError, ValidationError } from "../../../utils/errors";
import logger from "../../../config/logger";

export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    // Format validation errors nicely
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

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  const graphql = getGraphQLClient();

  try {
    // Try to insert user; rely on unique constraint for duplicate phone
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

    // ✨ ULTIMATE CLEAN SYNTAX - Just res.created()!
    res.created("Registration initiated. Please verify OTP.", {
      userId: result.insert_user_account_one.id,
    });
  } catch (error: any) {
    logger.error("Registration failed", { error });

    // Check for unique constraint violation
    const isUniqueViolation =
      typeof error?.response?.errors?.[0]?.message === "string" &&
      error.response.errors[0].message.includes("unique");

    if (isUniqueViolation) {
      throw new ConflictError("Phone already registered");
    }

    // Re-throw other errors
    throw error;
  }
});
