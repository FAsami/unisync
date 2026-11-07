import bcrypt from "bcrypt";
import { fakeHasura } from "./fakeHasura";

export const PHONE = "+8801712345678";
export const PASSWORD = "Str0ng!pass";

/**
 * A tiny in-memory user_session table so login -> refresh -> logout can be
 * exercised end to end against the real controllers.
 */
export const installSessionTable = () => {
  const sessions = new Map<string, any>();
  let generated = 0;

  fakeHasura.on("InsertSession", ({ session }) => {
    // Mirror Postgres: id defaults to gen_random_uuid() when not supplied.
    const row = { id: session.id ?? `db-generated-${++generated}`, ...session };
    sessions.set(row.id, row);
    return { insert_user_session_one: row };
  });
  fakeHasura.on("GetSessionByRefreshToken", ({ refresh_token }) => ({
    user_session: [...sessions.values()].filter(
      (s) => s.refresh_token === refresh_token
    ),
  }));
  fakeHasura.on("UpdateSession", ({ id, session }) => {
    const row = sessions.get(id);
    if (!row) return { update_user_session_by_pk: null };
    Object.assign(row, session);
    return { update_user_session_by_pk: row };
  });
  fakeHasura.on("RevokeUserSessions", ({ user_id }) => {
    let affected_rows = 0;
    for (const s of sessions.values()) {
      if (s.user_id === user_id && !s.revoked) {
        s.revoked = true;
        affected_rows++;
      }
    }
    return { update_user_session: { affected_rows } };
  });

  return sessions;
};

export const installUser = async (overrides: Record<string, unknown> = {}) => {
  const user = {
    id: "user-1",
    phone: PHONE,
    password: await bcrypt.hash(PASSWORD, 4),
    role: "student",
    is_active: true,
    phone_verified_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    ...overrides,
  };
  fakeHasura.on("GetUserByPhone", ({ phone }) => ({
    user_account: phone === user.phone ? [user] : [],
  }));
  return user;
};

/**
 * A single live OTP row for identifier+purpose, backing checkAndConsumeOTP.
 */
export const installOTP = async (code: string, overrides: Record<string, unknown> = {}) => {
  const row = {
    id: "otp-1",
    otp_hash: await bcrypt.hash(code, 4),
    attempts: 0,
    verified: false,
    expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    ...overrides,
  };
  fakeHasura.on("GetActiveOTP", () => ({
    user_otp_transaction: row.verified ? [] : [row],
  }));
  fakeHasura.on("SetOTPAttempts", ({ attempts }) => {
    row.attempts = attempts;
    return { update_user_otp_transaction_by_pk: { id: row.id, attempts } };
  });
  fakeHasura.on("MarkOTPVerified", () => {
    row.verified = true;
    return { update_user_otp_transaction_by_pk: { id: row.id, verified: true } };
  });
  return row;
};
