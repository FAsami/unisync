import jwt from "jsonwebtoken";
import { JWTService, TokenPayload, DecodedToken } from "../../src/utils/jwt";
import { config } from "../../src/config/environment";

// Mock jwt module
jest.mock("jsonwebtoken");

describe("JWTService", () => {
  const mockPayload: TokenPayload = {
    sessionId: "test-session-id",
    userId: "test-user-id",
    role: "consumer",
  };

  const mockDecodedToken: DecodedToken = {
    ...mockPayload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateAccessToken", () => {
    it("should generate an access token with correct payload and options", () => {
      const mockToken = "mock-access-token";
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = JWTService.generateAccessToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, config.JWT_SECRET, {
        expiresIn: config.JWT_ACCESS_TOKEN_EXPIRY,
      });
      expect(result).toBe(mockToken);
    });

    it("should generate access token for guest user", () => {
      const guestPayload: TokenPayload = {
        sessionId: "guest-session-id",
        userId: null,
        role: "guest-consumer",
      };
      const mockToken = "mock-guest-token";
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = JWTService.generateAccessToken(guestPayload);

      expect(jwt.sign).toHaveBeenCalledWith(guestPayload, config.JWT_SECRET, {
        expiresIn: config.JWT_ACCESS_TOKEN_EXPIRY,
      });
      expect(result).toBe(mockToken);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a refresh token with correct payload and options", () => {
      const mockToken = "mock-refresh-token";
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = JWTService.generateRefreshToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, config.JWT_SECRET, {
        expiresIn: config.JWT_REFRESH_TOKEN_EXPIRY,
      });
      expect(result).toBe(mockToken);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify and return decoded access token", () => {
      const mockToken = "valid-access-token";
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

      const result = JWTService.verifyAccessToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.JWT_SECRET);
      expect(result).toEqual(mockDecodedToken);
    });

    it("should throw error for invalid access token", () => {
      const mockToken = "invalid-access-token";
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => JWTService.verifyAccessToken(mockToken)).toThrow(
        "Invalid access token"
      );
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.JWT_SECRET);
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify and return decoded refresh token", () => {
      const mockToken = "valid-refresh-token";
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

      const result = JWTService.verifyRefreshToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.JWT_SECRET);
      expect(result).toEqual(mockDecodedToken);
    });

    it("should throw error for invalid refresh token", () => {
      const mockToken = "invalid-refresh-token";
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => JWTService.verifyRefreshToken(mockToken)).toThrow(
        "Invalid refresh token"
      );
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.JWT_SECRET);
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid token", () => {
      const mockToken = "valid-token";
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      (jwt.decode as jest.Mock).mockReturnValue({
        ...mockDecodedToken,
        exp: futureExp,
      });

      const result = JWTService.isTokenExpired(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(false);
    });

    it("should return true for expired token", () => {
      const mockToken = "expired-token";
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      (jwt.decode as jest.Mock).mockReturnValue({
        ...mockDecodedToken,
        exp: pastExp,
      });

      const result = JWTService.isTokenExpired(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(true);
    });

    it("should return true for token without exp claim", () => {
      const mockToken = "token-without-exp";
      (jwt.decode as jest.Mock).mockReturnValue({
        ...mockDecodedToken,
        exp: undefined,
      });

      const result = JWTService.isTokenExpired(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(true);
    });

    it("should return true for invalid token", () => {
      const mockToken = "invalid-token";
      (jwt.decode as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = JWTService.isTokenExpired(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(true);
    });

    it("should return true for null decoded token", () => {
      const mockToken = "null-token";
      (jwt.decode as jest.Mock).mockReturnValue(null);

      const result = JWTService.isTokenExpired(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBe(true);
    });
  });

  describe("getTokenExpiration", () => {
    it("should return expiration date for valid token", () => {
      const mockToken = "valid-token";
      const expTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const expectedDate = new Date(expTime * 1000);
      (jwt.decode as jest.Mock).mockReturnValue({
        ...mockDecodedToken,
        exp: expTime,
      });

      const result = JWTService.getTokenExpiration(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(expectedDate);
    });

    it("should return null for token without exp claim", () => {
      const mockToken = "token-without-exp";
      (jwt.decode as jest.Mock).mockReturnValue({
        ...mockDecodedToken,
        exp: undefined,
      });

      const result = JWTService.getTokenExpiration(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBeNull();
    });

    it("should return null for invalid token", () => {
      const mockToken = "invalid-token";
      (jwt.decode as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = JWTService.getTokenExpiration(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBeNull();
    });

    it("should return null for null decoded token", () => {
      const mockToken = "null-token";
      (jwt.decode as jest.Mock).mockReturnValue(null);

      const result = JWTService.getTokenExpiration(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toBeNull();
    });
  });
});
