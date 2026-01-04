import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { registerSchema } from "../../../schemas";
import {
  DELETE_USER,
  INSERT_FACULTY_PROFILE,
  INSERT_USER,
} from "../gql/mutation";
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

  let {
    phone,
    password,
    email,
    role,
    student_id,
    first_name,
    last_name,
    department_id,
    batch_id,
    section_id,
    date_of_birth,
    gender,
    blood_group,
    address,
    designation,
    faculty_id,
    description,
  } = parsed.data;

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

  const userObject: any = {
    phone: phone,
    email: email ?? null,
    password: passwordHash,
    role: role,
    is_active: true,
  };

  if (role === "student") {
    userObject.profiles = {
      data: [
        {
          student_id,
          first_name,
          last_name,
          department_id,
          batch_id: batch_id ?? null,
          section_id: section_id ?? null,
          date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
          gender,
          blood_group,
          address,
        },
      ],
    };
  }

  const result = await graphql
    .request<{
      insert_user_account_one: { id: string };
    }>(INSERT_USER, {
      object: userObject,
    })
    .catch((error) => {
      console.error("Failed to create user account:", error);
      // Extract meaningful error message from GraphQL error
      const graphqlError = error?.response?.errors?.[0];
      if (graphqlError) {
        throw new Error(graphqlError.message || "Failed to create account");
      }
      throw new Error("Failed to create account");
    });

  if (!result.insert_user_account_one) {
    throw new Error("Failed to create account");
  }

  const userId = result.insert_user_account_one.id;

  if (role === "teacher") {
    try {
      await graphql.request(INSERT_FACULTY_PROFILE, {
        object: {
          user_id: userId,
          first_name,
          last_name,
          designation,
          faculty_id,
          department_id,
          description: description ?? null,
        },
      });
    } catch (error: any) {
      console.error("Failed to create faculty profile for user", userId, error);

      // Extract meaningful error message
      const graphqlError = error?.response?.errors?.[0];
      const errorMessage =
        graphqlError?.message || "Failed to create faculty profile";

      // Rollback user creation
      try {
        await graphql.request(DELETE_USER, { id: userId });
        console.log("Rolled back user creation for", userId);
      } catch (rollbackError) {
        console.error(
          "Critical: Failed to rollback user creation",
          userId,
          rollbackError
        );
      }
      throw new Error(errorMessage);
    }
  }

  res.created("Registration initiated. Please verify OTP.", {
    userId: userId,
  });
});
