import { getGraphQLClient } from "../../../lib/graphqlClient";
import { Request, Response } from "express";
import { CREATE_SESSION } from "../gql";
import { JWTService } from "../../../utils/jwt";
import { asyncHandler } from "../../../utils/response";
import {
  InsertSessionMutation,
  InsertSessionMutationVariables,
} from "../../../types";

export const generateGuestToken = asyncHandler(
  async (req: Request, res: Response) => {
    const graphqlClient = getGraphQLClient();
    const sessionId = crypto.randomUUID();
    const accessToken = JWTService.generateAccessToken({
      sessionId,
      userId: null,
      role: "guest-consumer",
    });
    const refreshToken = JWTService.generateRefreshToken({
      sessionId,
      userId: null,
      role: "guest-consumer",
    });
    const accessTokenExpires = JWTService.getTokenExpiration(accessToken);
    const refreshTokenExpires = JWTService.getTokenExpiration(refreshToken);
    const ipAddress = req.ip || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";

    const deviceInfo = {
      platform: req.header("x-platform") || null,
      browser: req.header("x-browser") || null,
    };

    const variables: InsertSessionMutationVariables = {
      session: {
        id: sessionId,
        user_id: null,
        access_token: accessToken,
        access_token_expires_at:
          accessTokenExpires?.toISOString() ||
          new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        refresh_token: refreshToken,
        refresh_token_expires_at:
          refreshTokenExpires?.toISOString() ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        revoked: false,
        ip_address: ipAddress,
        device_info: deviceInfo,
        user_agent: userAgent,
        last_used_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    const result = await graphqlClient.request<InsertSessionMutation>(
      CREATE_SESSION,
      variables
    );

    res.created("Guest session created successfully", {
      session_id: result.insert_user_session_one.id,
      access_token: result.insert_user_session_one.access_token,
      refresh_token: result.insert_user_session_one.refresh_token,
      expires_at: result.insert_user_session_one.access_token_expires_at,
    });
  }
);
