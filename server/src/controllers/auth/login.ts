import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { loginSchema } from "../../schemas";
import { GET_USER_BY_PHONE } from "./gql/queries";
import { CREATE_SESSION } from "./gql/mutation";
import { JWTService } from "../../utils/jwt";
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

  const payload = {
    sessionId: crypto.randomUUID(),
    userId: user.id,
    role: (user.role as "consumer") || "consumer",
  };
  const accessToken = JWTService.generateAccessToken(payload);
  const refreshToken = JWTService.generateRefreshToken(payload);
  const accessExp = JWTService.getTokenExpiration(accessToken);
  const refreshExp = JWTService.getTokenExpiration(refreshToken);

  const sessionResult = await graphql.request<{
    insert_user_session_one: {
      id: string;
      access_token: string;
      refresh_token: string;
    };
  }>(CREATE_SESSION, {
    session: {
      user_id: user.id,
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
      session_id: sessionResult.insert_user_session_one.id,
      access_token: accessToken,
      refresh_token: refreshToken,
      role: payload.role,
      isDeleted: user.deleted_at !== null,
      isVerified: user.phone_verified_at !== null,
    });
});
