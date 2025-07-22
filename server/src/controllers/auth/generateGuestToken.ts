import { getGraphQLClient } from "../../lib/graphqlClient";
import { ApiResponse } from "../../utils/response/ApiResponse";
import { Request, Response } from "express";
import {
  InsertSessionMutation,
  InsertSessionMutationVariables,
} from "../../types/generated";
import { CREATE_SESSION } from "./gql";
import { JWTService } from "../../utils/jwt";

export const generateGuestToken = async (req: Request, res: Response) => {
  try {
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
      platform: req.header("x-platform") || "web",
      browser: req.header("x-browser") || "Unknown",
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
    const sessionData = result.insert_user_session_one;

    if (!sessionData) {
      throw new Error("Failed to create session");
    }

    const response = ApiResponse.created(
      {
        session_id: sessionData.id,
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
        expires_at: sessionData.access_token_expires_at,
        user_type: "guest",
      },
      "Guest session created successfully",
      req
    );

    res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error("Error generating guest token:", error);

    const errorResponse = ApiResponse.error(
      "Failed to generate guest token",
      500,
      "GUEST_TOKEN_GENERATION_FAILED",
      req,
      error instanceof Error ? error.message : "Unknown error"
    );

    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
};
