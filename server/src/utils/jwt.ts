import jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { TokenPayload, DecodedToken, TokenType } from "../types";

/**
 * Access and refresh tokens share one signing secret, so each token carries a
 * `typ` claim and each verifier rejects the other kind. Without it a 30-day
 * refresh token is accepted anywhere an access token is.
 *
 * Tokens issued before `typ` existed have no claim; they are still accepted by
 * both verifiers so existing sessions keep working until they expire.
 */
export class JWTService {
  private static sign(
    payload: TokenPayload,
    typ: TokenType,
    expiresIn: string
  ): string {
    // Strip any claims a caller may have copied from a decoded token.
    const { sessionId, userId, role } = payload;
    return jwt.sign({ sessionId, userId, role, typ }, config.JWT_SECRET, {
      expiresIn,
    } as jwt.SignOptions);
  }

  private static verify(token: string, expected: TokenType): DecodedToken {
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;
    } catch {
      throw new Error(`Invalid ${expected} token`);
    }
    if (decoded.typ && decoded.typ !== expected) {
      throw new Error(`Invalid ${expected} token`);
    }
    return decoded;
  }

  static generateAccessToken(payload: TokenPayload): string {
    return this.sign(payload, "access", config.JWT_ACCESS_TOKEN_EXPIRY);
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return this.sign(payload, "refresh", config.JWT_REFRESH_TOKEN_EXPIRY);
  }

  /** Verifies signature, expiry and token type. Throws on any failure. */
  static verifyAccessToken(token: string): DecodedToken {
    return this.verify(token, "access");
  }

  /** Verifies signature, expiry and token type. Throws on any failure. */
  static verifyRefreshToken(token: string): DecodedToken {
    return this.verify(token, "refresh");
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch {
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
    } catch {
      return null;
    }
  }
}
