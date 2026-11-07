import { describe, it, expect } from "vitest";
import { api } from "./helpers/app";
import { fakeHasura } from "./helpers/fakeHasura";
import { installOTP, installSessionTable, PHONE } from "./helpers/fixtures";

const installAccount = (overrides: Record<string, unknown> = {}) => {
  const account = { id: "user-1", phone: PHONE, is_active: true, deleted_at: null, role: "student", ...overrides };
  fakeHasura.on("GetAccountByPhone", () => ({ user_account: [account] }));
  fakeHasura.on("SoftDeleteUserAccount", () => ({
    update_user_account_by_pk: { id: account.id, is_active: false, deleted_at: "2026-11-07T00:00:00Z" },
  }));
  return account;
};

const del = (otp: string) =>
  api().post("/api/v1/auth/account/delete").send({ phone: PHONE, otp });

describe("/auth/account/delete", () => {
  it("soft-deletes the account and revokes all of its sessions", async () => {
    const sessions = installSessionTable();
    sessions.set("s-1", { id: "s-1", user_id: "user-1", revoked: false });
    sessions.set("s-2", { id: "s-2", user_id: "user-1", revoked: false });
    sessions.set("other", { id: "other", user_id: "user-2", revoked: false });
    installAccount();
    await installOTP("123456");

    const res = await del("123456");
    expect(res.status).toBe(200);
    expect(fakeHasura.callsTo("SoftDeleteUserAccount")).toHaveLength(1);
    expect(sessions.get("s-1").revoked).toBe(true);
    expect(sessions.get("s-2").revoked).toBe(true);
    expect(sessions.get("other").revoked).toBe(false);
  });

  it("does nothing with a wrong OTP", async () => {
    installAccount();
    const row = await installOTP("123456");
    const res = await del("999999");
    expect(res.status).toBe(400);
    expect(row.attempts).toBe(1);
    expect(fakeHasura.callsTo("SoftDeleteUserAccount")).toHaveLength(0);
  });

  it("refuses an already deleted account", async () => {
    installAccount({ is_active: false, deleted_at: "2026-01-01T00:00:00Z" });
    const res = await del("123456");
    expect(res.status).toBe(400);
    expect(res.body.extensions.code).toBe("ACCOUNT_ALREADY_DELETED");
  });
});
