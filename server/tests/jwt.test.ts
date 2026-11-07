import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { JWTService } from "../src/utils/jwt";

const payload = { sessionId: "s-1", userId: "u-1", role: "student" as const };

describe("JWTService", () => {
  it("round-trips an access token", () => {
    const token = JWTService.generateAccessToken(payload);
    const decoded = JWTService.verifyAccessToken(token);
    expect(decoded).toMatchObject({ ...payload, typ: "access" });
  });

  it("refuses a refresh token where an access token is required", () => {
    const refresh = JWTService.generateRefreshToken(payload);
    expect(() => JWTService.verifyAccessToken(refresh)).toThrow();
  });

  it("refuses an access token where a refresh token is required", () => {
    const access = JWTService.generateAccessToken(payload);
    expect(() => JWTService.verifyRefreshToken(access)).toThrow();
  });

  it("still accepts legacy tokens issued without a typ claim", () => {
    const legacy = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    expect(JWTService.verifyAccessToken(legacy).sessionId).toBe("s-1");
    expect(JWTService.verifyRefreshToken(legacy).sessionId).toBe("s-1");
  });

  it("rejects tokens signed with another secret", () => {
    const forged = jwt.sign(payload, "some-other-secret-of-sufficient-length");
    expect(() => JWTService.verifyAccessToken(forged)).toThrow();
  });

  it("rejects expired tokens", () => {
    const expired = jwt.sign(
      { ...payload, typ: "access", exp: Math.floor(Date.now() / 1000) - 10 },
      process.env.JWT_SECRET!
    );
    expect(() => JWTService.verifyAccessToken(expired)).toThrow();
    expect(JWTService.isTokenExpired(expired)).toBe(true);
  });

  it("does not leak claims copied from a decoded token into new tokens", () => {
    const decoded = JWTService.verifyAccessToken(
      JWTService.generateAccessToken(payload)
    );
    // refreshTokens passes decoded-token fields back in; exp/iat must not carry over
    const reissued = JWTService.generateRefreshToken(decoded);
    expect(JWTService.verifyRefreshToken(reissued).typ).toBe("refresh");
  });
});
