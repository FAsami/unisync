import { Request, Response } from "express";
import { refreshTokens } from "../../../src/controllers/auth/refreshTokens";
import { getGraphQLClient } from "../../../src/lib/graphqlClient";
import { JWTService } from "../../../src/utils/jwt";

// Mock GraphQLClient
jest.mock("graphql-request", () => ({
  GraphQLClient: jest.fn().mockImplementation(
    (endpoint: string, options: any) =>
      ({
        endpoint,
        options,
        request: jest.fn(),
      } as any)
  ),
}));

// Mock dependencies
jest.mock("../../../src/lib/graphqlClient");
jest.mock("../../../src/utils/jwt");

const mockGraphQLClient = getGraphQLClient as jest.MockedFunction<
  typeof getGraphQLClient
>;
const mockJWTService = JWTService as jest.Mocked<typeof JWTService>;

describe("refreshTokens", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockClient: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      ip: "127.0.0.1",
      get: jest.fn(),
      method: "POST",
      path: "/api/v1/auth/refresh",
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockClient = {
      request: jest.fn(),
    };
    mockGraphQLClient.mockReturnValue(mockClient);

    jest.clearAllMocks();
  });

  describe("successful token refresh", () => {
    it("should refresh tokens for valid guest session", async () => {
      const refreshToken = "valid-refresh-token";
      const sessionId = "session-123";
      const userId = null;
      const role = "guest-consumer";

      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId,
        userId,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const existingSession = {
        id: sessionId,
        user_id: userId,
        access_token: "old-access-token",
        access_token_expires_at: "2024-01-01T12:00:00Z",
        refresh_token: refreshToken,
        refresh_token_expires_at: "2024-01-30T12:00:00Z",
        revoked: false,
        ip_address: "127.0.0.1",
        device_info: { platform: "web" },
        user_agent: "test-agent",
        last_used_at: "2024-01-01T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      };

      const newAccessToken = "new-access-token";
      const newRefreshToken = "new-refresh-token";
      const accessTokenExpires = new Date(Date.now() + 3600000);
      const refreshTokenExpires = new Date(Date.now() + 2592000000);

      // Mock session query
      mockClient.request.mockResolvedValueOnce({
        user_session: [existingSession],
      });

      // Mock token generation
      mockJWTService.generateAccessToken.mockReturnValue(newAccessToken);
      mockJWTService.generateRefreshToken.mockReturnValue(newRefreshToken);
      mockJWTService.getTokenExpiration
        .mockReturnValueOnce(accessTokenExpires)
        .mockReturnValueOnce(refreshTokenExpires);

      // Mock session update
      const updatedSession = {
        ...existingSession,
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        access_token_expires_at: accessTokenExpires.toISOString(),
        refresh_token_expires_at: refreshTokenExpires.toISOString(),
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockClient.request.mockResolvedValueOnce({
        update_user_session_by_pk: updatedSession,
      });

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockClient.request).toHaveBeenCalledTimes(2);
      expect(mockJWTService.generateAccessToken).toHaveBeenCalledWith({
        sessionId,
        userId,
        role,
      });
      expect(mockJWTService.generateRefreshToken).toHaveBeenCalledWith({
        sessionId,
        userId,
        role,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            session_id: sessionId,
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_at: accessTokenExpires.toISOString(),
            user_type: "guest",
          }),
          message: "Tokens refreshed successfully",
        })
      );
    });

    it("should refresh tokens for valid user session", async () => {
      const refreshToken = "valid-user-refresh-token";
      const sessionId = "user-session-456";
      const userId = "user-789";
      const role = "consumer";

      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId,
        userId,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const existingSession = {
        id: sessionId,
        user_id: userId,
        access_token: "old-access-token",
        access_token_expires_at: "2024-01-01T12:00:00Z",
        refresh_token: refreshToken,
        refresh_token_expires_at: "2024-01-30T12:00:00Z",
        revoked: false,
        ip_address: "127.0.0.1",
        device_info: { platform: "mobile" },
        user_agent: "mobile-app",
        last_used_at: "2024-01-01T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      };

      const newAccessToken = "new-user-access-token";
      const newRefreshToken = "new-user-refresh-token";
      const accessTokenExpires = new Date(Date.now() + 3600000);
      const refreshTokenExpires = new Date(Date.now() + 2592000000);

      mockClient.request
        .mockResolvedValueOnce({
          user_session: [existingSession],
        })
        .mockResolvedValueOnce({
          update_user_session_by_pk: {
            ...existingSession,
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            access_token_expires_at: accessTokenExpires.toISOString(),
            refresh_token_expires_at: refreshTokenExpires.toISOString(),
          },
        });

      mockJWTService.generateAccessToken.mockReturnValue(newAccessToken);
      mockJWTService.generateRefreshToken.mockReturnValue(newRefreshToken);
      mockJWTService.getTokenExpiration
        .mockReturnValueOnce(accessTokenExpires)
        .mockReturnValueOnce(refreshTokenExpires);

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            session_id: sessionId,
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            user_type: "user",
          }),
        })
      );
    });
  });

  describe("error scenarios", () => {
    it("should return 401 when session is not found", async () => {
      const refreshToken = "non-existent-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId: "session-123",
        userId: null,
        role: "guest-consumer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      mockClient.request.mockResolvedValueOnce({
        user_session: [], // Empty array - session not found
      });

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: "Session not found",
            code: "SESSION_NOT_FOUND",
          }),
        })
      );
    });

    it("should return 401 when session is revoked", async () => {
      const refreshToken = "revoked-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId: "session-123",
        userId: null,
        role: "guest-consumer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const revokedSession = {
        id: "session-123",
        user_id: null,
        access_token: "old-access-token",
        access_token_expires_at: "2024-01-01T12:00:00Z",
        refresh_token: refreshToken,
        refresh_token_expires_at: "2024-01-30T12:00:00Z",
        revoked: true, // Session is revoked
        ip_address: "127.0.0.1",
        device_info: { platform: "web" },
        user_agent: "test-agent",
        last_used_at: "2024-01-01T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      };

      mockClient.request.mockResolvedValueOnce({
        user_session: [revokedSession],
      });

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: "Session has been revoked",
            code: "SESSION_REVOKED",
          }),
        })
      );
    });

    it("should return 401 when session ID does not match token", async () => {
      const refreshToken = "mismatched-session-token";
      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId: "token-session-id",
        userId: null,
        role: "guest-consumer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const sessionWithDifferentId = {
        id: "different-session-id", // Different from token
        user_id: null,
        access_token: "old-access-token",
        access_token_expires_at: "2024-01-01T12:00:00Z",
        refresh_token: refreshToken,
        refresh_token_expires_at: "2024-01-30T12:00:00Z",
        revoked: false,
        ip_address: "127.0.0.1",
        device_info: { platform: "web" },
        user_agent: "test-agent",
        last_used_at: "2024-01-01T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      };

      mockClient.request.mockResolvedValueOnce({
        user_session: [sessionWithDifferentId],
      });

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: "Session mismatch",
            code: "SESSION_MISMATCH",
          }),
        })
      );
    });

    it("should return 500 when session update fails", async () => {
      const refreshToken = "valid-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId: "session-123",
        userId: null,
        role: "guest-consumer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const existingSession = {
        id: "session-123",
        user_id: null,
        access_token: "old-access-token",
        access_token_expires_at: "2024-01-01T12:00:00Z",
        refresh_token: refreshToken,
        refresh_token_expires_at: "2024-01-30T12:00:00Z",
        revoked: false,
        ip_address: "127.0.0.1",
        device_info: { platform: "web" },
        user_agent: "test-agent",
        last_used_at: "2024-01-01T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      };

      mockClient.request
        .mockResolvedValueOnce({
          user_session: [existingSession],
        })
        .mockResolvedValueOnce({
          update_user_session_by_pk: null, // Update failed
        });

      mockJWTService.generateAccessToken.mockReturnValue("new-access-token");
      mockJWTService.generateRefreshToken.mockReturnValue("new-refresh-token");
      mockJWTService.getTokenExpiration.mockReturnValue(
        new Date(Date.now() + 3600000)
      );

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: "Failed to refresh tokens",
            code: "TOKEN_REFRESH_FAILED",
          }),
        })
      );
    });

    it("should return 500 when GraphQL query fails", async () => {
      const refreshToken = "valid-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId: "session-123",
        userId: null,
        role: "guest-consumer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const graphqlError = new Error("GraphQL connection failed");
      mockClient.request.mockRejectedValueOnce(graphqlError);

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: "Failed to refresh tokens",
            code: "TOKEN_REFRESH_FAILED",
            details: "GraphQL connection failed",
          }),
        })
      );
    });

    it("should handle token generation errors", async () => {
      const refreshToken = "valid-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId: "session-123",
        userId: null,
        role: "guest-consumer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const existingSession = {
        id: "session-123",
        user_id: null,
        access_token: "old-access-token",
        access_token_expires_at: "2024-01-01T12:00:00Z",
        refresh_token: refreshToken,
        refresh_token_expires_at: "2024-01-30T12:00:00Z",
        revoked: false,
        ip_address: "127.0.0.1",
        device_info: { platform: "web" },
        user_agent: "test-agent",
        last_used_at: "2024-01-01T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      };

      mockClient.request.mockResolvedValueOnce({
        user_session: [existingSession],
      });

      const tokenError = new Error("Token generation failed");
      mockJWTService.generateAccessToken.mockImplementation(() => {
        throw tokenError;
      });

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: "Failed to refresh tokens",
            code: "TOKEN_REFRESH_FAILED",
            details: "Token generation failed",
          }),
        })
      );
    });
  });

  describe("edge cases", () => {
    it("should handle missing token expiration gracefully", async () => {
      const refreshToken = "valid-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId: "session-123",
        userId: null,
        role: "guest-consumer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      const existingSession = {
        id: "session-123",
        user_id: null,
        access_token: "old-access-token",
        access_token_expires_at: "2024-01-01T12:00:00Z",
        refresh_token: refreshToken,
        refresh_token_expires_at: "2024-01-30T12:00:00Z",
        revoked: false,
        ip_address: "127.0.0.1",
        device_info: { platform: "web" },
        user_agent: "test-agent",
        last_used_at: "2024-01-01T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      };

      const newAccessToken = "new-access-token";
      const newRefreshToken = "new-refresh-token";

      mockClient.request
        .mockResolvedValueOnce({
          user_session: [existingSession],
        })
        .mockResolvedValueOnce({
          update_user_session_by_pk: {
            ...existingSession,
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            access_token_expires_at: new Date(
              Date.now() + 60 * 60 * 1000
            ).toISOString(),
            refresh_token_expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        });

      mockJWTService.generateAccessToken.mockReturnValue(newAccessToken);
      mockJWTService.generateRefreshToken.mockReturnValue(newRefreshToken);
      mockJWTService.getTokenExpiration.mockReturnValue(null); // No expiration

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            session_id: "session-123",
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
          }),
        })
      );
    });

    it("should handle unknown errors gracefully", async () => {
      const refreshToken = "valid-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      mockRequest.user = {
        sessionId: "session-123",
        userId: null,
        role: "guest-consumer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      // Simulate an unknown error (not an Error instance)
      mockClient.request.mockRejectedValueOnce("Unknown error");

      await refreshTokens(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: "Failed to refresh tokens",
            code: "TOKEN_REFRESH_FAILED",
            details: "Unknown error",
          }),
        })
      );
    });
  });
});
