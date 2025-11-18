import { getGraphQLClient } from "../../../lib/graphqlClient";
import { Request, Response } from "express";
import { UPDATE_SESSION, GET_SESSION_BY_REFRESH_TOKEN } from "../gql";
import { JWTService } from "../../../utils/jwt";
import { asyncHandler } from "../../../utils/response";
import { UnauthorizedError } from "../../../utils/errors";
import { SessionData } from "../../../types";

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const graphqlClient = getGraphQLClient();
    const { refresh_token } = req.body;
    const decoded = req.user!;

    const sessionResult = await graphqlClient.request<{
      user_session: SessionData[];
    }>(GET_SESSION_BY_REFRESH_TOKEN, { refresh_token });

    const session = sessionResult.user_session[0];

    if (!session) {
      throw new UnauthorizedError("Session not found", "SESSION_NOT_FOUND");
    }

    if (session.revoked) {
      throw new UnauthorizedError(
        "Session has been revoked",
        "SESSION_REVOKED"
      );
    }

    // Verify session ID matches the decoded token
    if (session.id !== decoded.sessionId) {
      throw new UnauthorizedError("Session mismatch", "SESSION_MISMATCH");
    }

    // Generate new tokens
    const newAccessToken = JWTService.generateAccessToken({
      sessionId: decoded.sessionId,
      userId: decoded.userId,
      role: decoded.role,
    });

    const newRefreshToken = JWTService.generateRefreshToken({
      sessionId: decoded.sessionId,
      userId: decoded.userId,
      role: decoded.role,
    });

    const accessTokenExpires = JWTService.getTokenExpiration(newAccessToken);
    const refreshTokenExpires = JWTService.getTokenExpiration(newRefreshToken);

    // Update session in database
    const result = await graphqlClient.request<{
      update_user_session_by_pk: SessionData | null;
    }>(UPDATE_SESSION, {
      id: session.id,
      session: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        access_token_expires_at:
          accessTokenExpires?.toISOString() ||
          new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        refresh_token_expires_at:
          refreshTokenExpires?.toISOString() ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    const updatedSession = result.update_user_session_by_pk;

    if (!updatedSession) {
      throw new Error("Failed to update session");
    }

    res.success("Tokens refreshed successfully", {
      session_id: updatedSession.id,
      access_token: updatedSession.access_token,
      refresh_token: updatedSession.refresh_token,
      expires_at: updatedSession.access_token_expires_at,
    });
  }
);
