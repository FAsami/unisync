import { Request, Response, NextFunction } from "express";
import {
  authenticate,
  guestOnly,
  userOnly,
  optionalAuth,
  verifyRefreshToken,
} from "../../src/middleware/auth";
import { JWTService } from "../../src/utils/jwt";
import { ApiResponse } from "../../src/utils/response/ApiResponse";

// Mock JWTService
jest.mock("../../src/utils/jwt");
const mockJWTService = JWTService as jest.Mocked<typeof JWTService>;

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {},
      ip: "127.0.0.1",
      get: jest.fn(),
      method: "GET",
      path: "/api/v1",
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    describe("with requireAuth = true (default)", () => {
      it("should return 401 when no authorization header", () => {
        const middleware = authenticate();

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            data: null,
            error: expect.objectContaining({
              message: "Authorization header required",
              code: "MISSING_AUTH_HEADER",
              details: undefined,
            }),
            meta: expect.objectContaining({
              method: "GET",
              path: "/api/v1",
              requestId: undefined,
              timestamp: expect.any(String),
            }),
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it("should return 401 for invalid authorization header format", () => {
        mockRequest.headers = { authorization: "InvalidFormat token123" };
        const middleware = authenticate();

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            data: null,
            error: expect.objectContaining({
              message: "Invalid authorization header format",
              code: "INVALID_AUTH_HEADER",
              details: undefined,
            }),
            meta: expect.objectContaining({
              method: "GET",
              path: "/api/v1",
              requestId: undefined,
              timestamp: expect.any(String),
            }),
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it("should return 401 for empty token", () => {
        mockRequest.headers = { authorization: "Bearer " };
        const middleware = authenticate();

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            data: null,
            error: expect.objectContaining({
              message: "Invalid authorization header format",
              code: "INVALID_AUTH_HEADER",
              details: undefined,
            }),
            meta: expect.objectContaining({
              method: "GET",
              path: "/api/v1",
              requestId: undefined,
              timestamp: expect.any(String),
            }),
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it("should return 401 for expired token", () => {
        const token = "valid-token";
        mockRequest.headers = { authorization: `Bearer ${token}` };
        const decodedToken = {
          sessionId: "session1",
          userId: "user1",
          role: "consumer" as const,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        };

        mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
        mockJWTService.isTokenExpired.mockReturnValue(true);

        const middleware = authenticate();

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockJWTService.verifyAccessToken).toHaveBeenCalledWith(token);
        expect(mockJWTService.isTokenExpired).toHaveBeenCalledWith(token);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            data: null,
            error: expect.objectContaining({
              message: "Token has expired",
              code: "TOKEN_EXPIRED",
              details: undefined,
            }),
            meta: expect.objectContaining({
              method: "GET",
              path: "/api/v1",
              requestId: undefined,
              timestamp: expect.any(String),
            }),
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it("should return 403 when requireUser=true and role is guest", () => {
        const token = "valid-token";
        mockRequest.headers = { authorization: `Bearer ${token}` };
        const decodedToken = {
          sessionId: "session1",
          userId: null,
          role: "guest-consumer" as const,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        };

        mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
        mockJWTService.isTokenExpired.mockReturnValue(false);

        const middleware = authenticate({ requireUser: true });

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            data: null,
            error: expect.objectContaining({
              message: "User authentication required",
              code: "USER_AUTH_REQUIRED",
              details: undefined,
            }),
            meta: expect.objectContaining({
              method: "GET",
              path: "/api/v1",
              requestId: undefined,
              timestamp: expect.any(String),
            }),
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it("should return 403 when allowGuest=false and role is guest", () => {
        const token = "valid-token";
        mockRequest.headers = { authorization: `Bearer ${token}` };
        const decodedToken = {
          sessionId: "session1",
          userId: null,
          role: "guest-consumer" as const,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        };

        mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
        mockJWTService.isTokenExpired.mockReturnValue(false);

        const middleware = authenticate({ allowGuest: false });

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            data: null,
            error: expect.objectContaining({
              message: "Guest access not allowed",
              code: "GUEST_ACCESS_DENIED",
              details: undefined,
            }),
            meta: expect.objectContaining({
              method: "GET",
              path: "/api/v1",
              requestId: undefined,
              timestamp: expect.any(String),
            }),
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });

      it("should call next() for valid user token", () => {
        const token = "valid-token";
        mockRequest.headers = { authorization: `Bearer ${token}` };
        const decodedToken = {
          sessionId: "session1",
          userId: "user1",
          role: "consumer" as const,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        };

        mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
        mockJWTService.isTokenExpired.mockReturnValue(false);

        const middleware = authenticate();

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockJWTService.verifyAccessToken).toHaveBeenCalledWith(token);
        expect(mockJWTService.isTokenExpired).toHaveBeenCalledWith(token);
        expect(mockRequest.user).toEqual(decodedToken);
        expect(mockNext).toHaveBeenCalled();
      });

      it("should call next() for valid guest token when allowGuest=true", () => {
        const token = "valid-token";
        mockRequest.headers = { authorization: `Bearer ${token}` };
        const decodedToken = {
          sessionId: "session1",
          userId: null,
          role: "guest-consumer" as const,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        };

        mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
        mockJWTService.isTokenExpired.mockReturnValue(false);

        const middleware = authenticate({ allowGuest: true });

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.user).toEqual(decodedToken);
        expect(mockNext).toHaveBeenCalled();
      });

      it("should return 401 for JWT verification error", () => {
        const token = "invalid-token";
        mockRequest.headers = { authorization: `Bearer ${token}` };

        mockJWTService.verifyAccessToken.mockImplementation(() => {
          throw new Error("Invalid token");
        });

        const middleware = authenticate();

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            data: null,
            error: expect.objectContaining({
              message: "Authentication failed",
              code: "AUTH_FAILED",
              details: "Invalid token",
            }),
            meta: expect.objectContaining({
              method: "GET",
              path: "/api/v1",
              requestId: undefined,
              timestamp: expect.any(String),
            }),
          })
        );
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe("with requireAuth = false", () => {
      it("should call next() when no authorization header", () => {
        const middleware = authenticate({ requireAuth: false });

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it("should process token when authorization header is present", () => {
        const token = "valid-token";
        mockRequest.headers = { authorization: `Bearer ${token}` };
        const decodedToken = {
          sessionId: "session1",
          userId: "user1",
          role: "consumer" as const,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        };

        mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
        mockJWTService.isTokenExpired.mockReturnValue(false);

        const middleware = authenticate({ requireAuth: false });

        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRequest.user).toEqual(decodedToken);
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe("guestOnly", () => {
    it("should allow guest users", () => {
      const token = "valid-token";
      mockRequest.headers = { authorization: `Bearer ${token}` };
      const decodedToken = {
        sessionId: "session1",
        userId: null,
        role: "guest-consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      guestOnly(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should allow regular users", () => {
      const token = "valid-token";
      mockRequest.headers = { authorization: `Bearer ${token}` };
      const decodedToken = {
        sessionId: "session1",
        userId: "user1",
        role: "consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      guestOnly(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("userOnly", () => {
    it("should allow regular users", () => {
      const token = "valid-token";
      mockRequest.headers = { authorization: `Bearer ${token}` };
      const decodedToken = {
        sessionId: "session1",
        userId: "user1",
        role: "consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      userOnly(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject guest users", () => {
      const token = "valid-token";
      mockRequest.headers = { authorization: `Bearer ${token}` };
      const decodedToken = {
        sessionId: "session1",
        userId: null,
        role: "guest-consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      userOnly(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          data: null,
          error: expect.objectContaining({
            message: "User authentication required",
            code: "USER_AUTH_REQUIRED",
            details: undefined,
          }),
          meta: expect.objectContaining({
            method: "GET",
            path: "/api/v1",
            requestId: undefined,
            timestamp: expect.any(String),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should call next() when no authorization header", () => {
      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should process token when authorization header is present", () => {
      const token = "valid-token";
      mockRequest.headers = { authorization: `Bearer ${token}` };
      const decodedToken = {
        sessionId: "session1",
        userId: "user1",
        role: "consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJWTService.verifyAccessToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should return 400 when refresh token is missing", () => {
      verifyRefreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          data: null,
          error: expect.objectContaining({
            message: "Refresh token required",
            code: "MISSING_REFRESH_TOKEN",
            details: undefined,
          }),
          meta: expect.objectContaining({
            method: "GET",
            path: "/api/v1",
            requestId: undefined,
            timestamp: expect.any(String),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 for expired refresh token", () => {
      const refreshToken = "expired-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      const decodedToken = {
        sessionId: "session1",
        userId: "user1",
        role: "consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJWTService.verifyRefreshToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(true);

      verifyRefreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(
        refreshToken
      );
      expect(mockJWTService.isTokenExpired).toHaveBeenCalledWith(refreshToken);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          data: null,
          error: expect.objectContaining({
            message: "Refresh token has expired",
            code: "REFRESH_TOKEN_EXPIRED",
            details: undefined,
          }),
          meta: expect.objectContaining({
            method: "GET",
            path: "/api/v1",
            requestId: undefined,
            timestamp: expect.any(String),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() for valid refresh token", () => {
      const refreshToken = "valid-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };
      const decodedToken = {
        sessionId: "session1",
        userId: "user1",
        role: "consumer" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJWTService.verifyRefreshToken.mockReturnValue(decodedToken);
      mockJWTService.isTokenExpired.mockReturnValue(false);

      verifyRefreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(
        refreshToken
      );
      expect(mockJWTService.isTokenExpired).toHaveBeenCalledWith(refreshToken);
      expect(mockRequest.user).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 401 for invalid refresh token", () => {
      const refreshToken = "invalid-refresh-token";
      mockRequest.body = { refresh_token: refreshToken };

      mockJWTService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("Invalid refresh token");
      });

      verifyRefreshToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          data: null,
          error: expect.objectContaining({
            message: "Invalid refresh token",
            code: "INVALID_REFRESH_TOKEN",
            details: "Invalid refresh token",
          }),
          meta: expect.objectContaining({
            method: "GET",
            path: "/api/v1",
            requestId: undefined,
            timestamp: expect.any(String),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
