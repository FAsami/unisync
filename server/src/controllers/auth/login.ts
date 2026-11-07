import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { loginSchema } from "../../schemas";
import { GET_USER_BY_PHONE } from "./gql/queries";
import { issueSession } from "./session/issueSession";
import { TokenPayload } from "../../types";
import { asyncHandler } from "../../utils/response";
import {
  ValidationError,
  InvalidCredentialsError,
  UserNotActiveError,
  UserNotFoundError,
  UserNotVerifiedError,
} from "../../utils/errors";
import { config } from "../../config/environment";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError("Invalid input");
  }

  const { phone, password } = parsed.data;
  const graphql = getGraphQLClient();

  const userResult = await graphql.request<{
    user_account: Array<{
      id: string;
      password: string;
      phone_verified_at: string | null;
      is_active: boolean;
      role: string;
      deleted_at: string | null;
    }>;
  }>(GET_USER_BY_PHONE, { phone });

  const user = userResult.user_account?.[0];
  if (!user) {
    throw new UserNotFoundError();
  }

  if (!user.is_active && user.deleted_at === null) {
    throw new UserNotActiveError();
  }

  if (!user.phone_verified_at) {
    throw new UserNotVerifiedError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const role = (user.role as TokenPayload["role"]) || "consumer";
  const { accessToken, refreshToken, accessExp, refreshExp, result } =
    await issueSession(req, { userId: user.id, role });

  const accessMaxAge =
    accessExp && accessExp.getTime() > Date.now()
      ? accessExp.getTime() - Date.now()
      : undefined;
  const refreshMaxAge =
    refreshExp && refreshExp.getTime() > Date.now()
      ? refreshExp.getTime() - Date.now()
      : undefined;

  const baseCookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  res
    .cookie("access_token", accessToken, {
      ...baseCookieOptions,
      maxAge: accessMaxAge,
      expires: accessExp ?? undefined,
    })
    .cookie("refresh_token", refreshToken, {
      ...baseCookieOptions,
      maxAge: refreshMaxAge,
      expires: refreshExp ?? undefined,
    })
    .success("Login successful", {
      session_id: result.insert_user_session_one.id,
      access_token: accessToken,
      refresh_token: refreshToken,
      role,
      isDeleted: user.deleted_at !== null,
      isVerified: user.phone_verified_at !== null,
    });
});
