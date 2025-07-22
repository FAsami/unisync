import { getGraphQLClient } from "../../lib/graphqlClient";
import { ApiResponse } from "../../utils/response/ApiResponse";
import { Request, Response } from "express";
import {
  UpdateSessionMutation,
  UpdateSessionMutationVariables,
  GetSessionByRefreshTokenQuery,
  GetSessionByRefreshTokenQueryVariables,
} from "../../types/generated";
import { UPDATE_SESSION, GET_SESSION_BY_REFRESH_TOKEN } from "./gql";
import { JWTService } from "../../utils/jwt";

export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const graphqlClient = getGraphQLClient();
    const { refresh_token } = req.body;
    const decoded = req.user!;

    const sessionQueryVariables: GetSessionByRefreshTokenQueryVariables = {
      refresh_token,
    };

    const sessionResult =
      await graphqlClient.request<GetSessionByRefreshTokenQuery>(
        GET_SESSION_BY_REFRESH_TOKEN,
        sessionQueryVariables
      );

    const session = sessionResult.user_session[0];

    if (!session) {
      return res
        .status(401)
        .json(
          ApiResponse.error("Session not found", 401, "SESSION_NOT_FOUND", req)
            .body
        );
    }

    if (session.revoked) {
      return res
        .status(401)
        .json(
          ApiResponse.error(
            "Session has been revoked",
            401,
            "SESSION_REVOKED",
            req
          ).body
        );
    }

    // Verify session ID matches the decoded token
    if (session.id !== decoded.sessionId) {
      return res
        .status(401)
        .json(
          ApiResponse.error("Session mismatch", 401, "SESSION_MISMATCH", req)
            .body
        );
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
    const updateVariables: UpdateSessionMutationVariables = {
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
    };

    const result = await graphqlClient.request<UpdateSessionMutation>(
      UPDATE_SESSION,
      updateVariables
    );

    const updatedSession = result.update_user_session_by_pk;

    if (!updatedSession) {
      throw new Error("Failed to update session");
    }

    const response = ApiResponse.success(
      {
        session_id: updatedSession.id,
        access_token: updatedSession.access_token,
        refresh_token: updatedSession.refresh_token,
        expires_at: updatedSession.access_token_expires_at,
        user_type: updatedSession.user_id ? "user" : "guest",
      },
      "Tokens refreshed successfully",
      200,
      req
    );

    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error("Error refreshing tokens:", error);

    const errorResponse = ApiResponse.error(
      "Failed to refresh tokens",
      500,
      "TOKEN_REFRESH_FAILED",
      req,
      error instanceof Error ? error.message : "Unknown error"
    );

    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }
};
