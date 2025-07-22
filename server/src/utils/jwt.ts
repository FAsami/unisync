import jwt from "jsonwebtoken";
import { config } from "../config/environment";

export interface TokenPayload {
  sessionId: string;
  userId: string | null;
  role: "guest-consumer" | "consumer";
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export class JWTService {
  static generateAccessToken(payload: TokenPayload): string {
    return (jwt as any).sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_TOKEN_EXPIRY,
    });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return (jwt as any).sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_REFRESH_TOKEN_EXPIRY,
    });
  }

  static verifyAccessToken(token: string): DecodedToken {
    try {
      return (jwt as any).verify(token, config.JWT_SECRET) as DecodedToken;
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  static verifyRefreshToken(token: string): DecodedToken {
    try {
      return (jwt as any).verify(token, config.JWT_SECRET) as DecodedToken;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      if (!decoded || !decoded.exp) {
        return null;
      }
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}
