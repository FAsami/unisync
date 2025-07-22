import { Request, Response } from "express";
import authorizeRequestWebhook from "../../../src/controllers/auth/authorizeRequestWebhook";
import { JWTService } from "../../../src/utils/jwt";
import { AppError } from "../../../src/utils/response/AppError";

// Mock JWTService
jest.mock("../../../src/utils/jwt");
const mockJWTService = JWTService as jest.Mocked<typeof JWTService>;

describe("authorizeRequestWebhook", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {
        headers: {},
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("successful authorization", () => {
    it("should return user headers for valid access token", () => {
      const accessToken = "valid-access-token";
      const decodedToken = {
        sessionId: "session-123",
        userId: "user-456",
        role: "consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.body = {
        headers: {
          "X-hasura-access-token": accessToken,
        },
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockJWTService.verifyAccessToken).toHaveBeenCalledWith(
        accessToken
      );
      expect(mockJWTService.isTokenExpired).toHaveBeenCalledWith(accessToken);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        "X-Hasura-User-Id": "user-456",
        "X-Hasura-Role": "consumer",
        "X-Hasura-Session-Id": "session-123",
      });
    });

    it("should return empty user ID when userId is null", () => {
      const accessToken = "valid-access-token";
      const decodedToken = {
        sessionId: "session-123",
        userId: null,
        role: "guest-consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.body = {
        headers: {
          "X-hasura-access-token": accessToken,
        },
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        "X-Hasura-User-Id": "",
        "X-Hasura-Role": "guest-consumer",
        "X-Hasura-Session-Id": "session-123",
      });
    });

    it("should handle guest consumer role", () => {
      const accessToken = "valid-access-token";
      const decodedToken = {
        sessionId: "guest-session-123",
        userId: null,
        role: "guest-consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.body = {
        headers: {
          "X-hasura-access-token": accessToken,
        },
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        "X-Hasura-User-Id": "",
        "X-Hasura-Role": "guest-consumer",
        "X-Hasura-Session-Id": "guest-session-123",
      });
    });
  });

  describe("error handling", () => {
    it("should return 401 when access token is missing", () => {
      mockRequest.body = {
        headers: {},
      };

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Access token is required",
      });
    });

    it("should return 401 when access token is empty", () => {
      mockRequest.body = {
        headers: {
          "X-hasura-access-token": "",
        },
      };

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Access token is required",
      });
    });

    it("should return 401 when access token is expired", () => {
      const accessToken = "expired-access-token";
      const decodedToken = {
        sessionId: "session-123",
        userId: "user-456",
        role: "consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.body = {
        headers: {
          "X-hasura-access-token": accessToken,
        },
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(true);

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Access token has expired",
      });
    });

    it("should return 500 for invalid access token", () => {
      const accessToken = "invalid-access-token";

      mockRequest.body = {
        headers: {
          "X-hasura-access-token": accessToken,
        },
      };

      mockJWTService.verifyAccessToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error during authorization",
      });
    });

    it("should return 401 for AppError during token verification", () => {
      const accessToken = "invalid-access-token";

      mockRequest.body = {
        headers: {
          "X-hasura-access-token": accessToken,
        },
      };

      mockJWTService.verifyAccessToken.mockImplementation(() => {
        throw new AppError("Invalid token", 401);
      });

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid token",
      });
    });

    it("should return 500 for unexpected errors", () => {
      const accessToken = "valid-access-token";

      mockRequest.body = {
        headers: {
          "X-hasura-access-token": accessToken,
        },
      };

      mockJWTService.verifyAccessToken.mockImplementation(() => {
        throw new Error("Unexpected database error");
      });

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error during authorization",
      });
    });
  });

  describe("request body handling", () => {
    it("should handle request body with console.log", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const accessToken = "valid-access-token";
      const decodedToken = {
        sessionId: "session-123",
        userId: "user-456",
        role: "consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.body = {
        headers: {
          "X-hasura-access-token": accessToken,
        },
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      authorizeRequestWebhook(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith("req.box", mockRequest.body);
      expect(consoleSpy).toHaveBeenCalledWith(
        "accesss token",
        mockRequest.body.headers
      );

      consoleSpy.mockRestore();
    });
  });
});
