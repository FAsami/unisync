import crypto from "crypto";
import { Request } from "express";
import { getGraphQLClient } from "../../../lib/graphqlClient";
import { CREATE_SESSION } from "../gql/mutation";
import { JWTService } from "../../../utils/jwt";
import { TokenPayload, User_Session } from "../../../types";

/**
 * Creates a user_session row and the token pair for it.
 *
 * The row id MUST equal the JWT `sessionId` claim: /auth/session/refresh
 * rejects a refresh token whose sessionId differs from the row it matches, and
 * /auth/logout revokes the row by the access token's sessionId. If the id were
 * left to the database default, neither would ever work.
 */
export const issueSession = async (
  req: Request,
  user: { userId: string | null; role: TokenPayload["role"] }
) => {
  const sessionId = crypto.randomUUID();
  const payload: TokenPayload = {
    sessionId,
    userId: user.userId,
    role: user.role,
  };

  const accessToken = JWTService.generateAccessToken(payload);
  const refreshToken = JWTService.generateRefreshToken(payload);
  const accessExp = JWTService.getTokenExpiration(accessToken);
  const refreshExp = JWTService.getTokenExpiration(refreshToken);

  const result = await getGraphQLClient().request<{
    insert_user_session_one: User_Session;
  }>(CREATE_SESSION, {
    session: {
      id: sessionId,
      user_id: user.userId,
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

  return {
    sessionId,
    payload,
    accessToken,
    refreshToken,
    accessExp,
    refreshExp,
    result,
  };
};
