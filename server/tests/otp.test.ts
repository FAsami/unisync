import { describe, it, expect } from "vitest";
import { api } from "./helpers/app";
import { fakeHasura } from "./helpers/fakeHasura";
import { installOTP, installSessionTable, installUser, PHONE } from "./helpers/fixtures";
import { MAX_OTP_ATTEMPTS, generateOTP } from "../src/controllers/otp/utils";

const verify = (otp: string, purpose = "SIGNUP") =>
  api().post("/api/v1/otp/verify").send({ identifier: PHONE, otp, purpose });

describe("generateOTP", () => {
  it("always produces a numeric code of the configured length", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOTP()).toMatch(/^\d{6}$/);
    }
  });
});

describe("/otp/verify", () => {
  it("accepts the right code once and only once", async () => {
    await installOTP("123456");
    expect((await verify("123456")).status).toBe(200);
    const replay = await verify("123456");
    expect(replay.status).toBe(400);
    expect(replay.body.extensions.code).toBe("INVALID_OTP");
  });

  it("counts wrong guesses and locks the code after the limit", async () => {
    const row = await installOTP("123456");
    for (let i = 1; i <= MAX_OTP_ATTEMPTS; i++) {
      const res = await verify("000000");
      expect(res.status).toBe(400);
      expect(res.body.extensions.details.attemptsRemaining).toBe(MAX_OTP_ATTEMPTS - i);
    }
    expect(row.attempts).toBe(MAX_OTP_ATTEMPTS);
    // Even the correct code is refused once locked.
    const res = await verify("123456");
    expect(res.body.extensions.code).toBe("MAX_ATTEMPTS_EXCEEDED");
  });
});

describe("OTP-consuming auth flows share the attempt limit", () => {
  it("register/verify cannot be brute forced", async () => {
    await installUser({ phone_verified_at: null });
    const row = await installOTP("123456");
    for (let i = 0; i < MAX_OTP_ATTEMPTS; i++) {
      await api().post("/api/v1/auth/register/verify").send({ phone: PHONE, otp: "000000" });
    }
    expect(row.attempts).toBe(MAX_OTP_ATTEMPTS);
    const res = await api()
      .post("/api/v1/auth/register/verify")
      .send({ phone: PHONE, otp: "123456" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("MAX_ATTEMPTS_EXCEEDED");
  });

  it("register/verify issues a session whose id matches the tokens", async () => {
    const sessions = installSessionTable();
    await installUser({ phone_verified_at: null });
    await installOTP("123456");
    fakeHasura.on("UpdateUserVerified", ({ id }) => ({
      update_user_account_by_pk: { id, phone_verified_at: "now" },
    }));

    const res = await api()
      .post("/api/v1/auth/register/verify")
      .send({ phone: PHONE, otp: "123456" });
    expect(res.status).toBe(200);
    const session = res.body.data.insert_user_session_one;
    expect(sessions.get(session.id)?.access_token).toBe(session.access_token);
  });

  it("reset-password/verify cannot be brute forced", async () => {
    await installUser();
    const row = await installOTP("123456");
    for (let i = 0; i < MAX_OTP_ATTEMPTS; i++) {
      await api()
        .post("/api/v1/auth/reset-password/verify")
        .send({ phone: PHONE, otp: "000000", newPassword: "N3w!password" });
    }
    expect(row.attempts).toBe(MAX_OTP_ATTEMPTS);
    expect(fakeHasura.callsTo("UpdateUserPassword")).toHaveLength(0);
  });
});

describe("/otp/send rate limiting", () => {
  const send = () =>
    api()
      .post("/api/v1/otp/send")
      .send({ identifier: PHONE, identifierType: "PHONE", purpose: "SIGNUP" });

  it("refuses to send once the per-number hourly quota is used", async () => {
    fakeHasura.on("GetRateLimit", () => ({
      user_otp_rate_limit: [
        { id: "r", attempt_count: 3, window_start: new Date().toISOString() },
      ],
    }));
    const res = await send();
    expect(res.status).toBe(429);
    expect(res.body.extensions.code).toBe("IDENTIFIER_RATE_LIMIT_EXCEEDED");
    expect(fakeHasura.callsTo("InsertOTP")).toHaveLength(0);
  });

  it("refuses to send once the per-IP hourly quota is used", async () => {
    fakeHasura
      .on("GetRateLimit", () => ({ user_otp_rate_limit: [] }))
      .on("GetRateLimitByIP", () => ({
        user_otp_rate_limit: [
          { id: "r", attempt_count: 10, window_start: new Date().toISOString() },
        ],
      }));
    const res = await send();
    expect(res.status).toBe(429);
    expect(res.body.extensions.code).toBe("IP_RATE_LIMIT_EXCEEDED");
  });
});
