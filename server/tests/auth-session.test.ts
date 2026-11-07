import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { api } from "./helpers/app";
import { fakeHasura } from "./helpers/fakeHasura";
import { installSessionTable, installUser, PHONE, PASSWORD } from "./helpers/fixtures";

const login = () => api().post("/api/v1/auth/login").send({ phone: PHONE, password: PASSWORD });

describe("login -> refresh -> logout", () => {
  it("stores the session under the same id the tokens carry", async () => {
    const sessions = installSessionTable();
    await installUser();

    const res = await login();
    expect(res.status).toBe(200);

    const claims = jwt.decode(res.body.data.access_token) as any;
    expect(res.body.data.session_id).toBe(claims.sessionId);
    expect(sessions.has(claims.sessionId)).toBe(true);
  });

  it("lets a freshly logged-in user refresh their tokens", async () => {
    installSessionTable();
    await installUser();
    const { body } = await login();

    const res = await api()
      .post("/api/v1/auth/session/refresh")
      .send({ refresh_token: body.data.refresh_token });

    expect(res.status).toBe(200);
    expect(res.body.data.session_id).toBe(body.data.session_id);
    expect(res.body.data.access_token).toEqual(expect.any(String));
  });

  it("logout revokes the caller's session and blocks further refreshes", async () => {
    const sessions = installSessionTable();
    await installUser();
    const { body } = await login();

    const out = await api()
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${body.data.access_token}`);
    expect(out.status).toBe(200);
    expect(sessions.get(body.data.session_id).revoked).toBe(true);

    const refresh = await api()
      .post("/api/v1/auth/session/refresh")
      .send({ refresh_token: body.data.refresh_token });
    expect(refresh.status).toBe(401);
    expect(refresh.body.error.code).toBe("SESSION_REVOKED");
  });

  it("refuses an access token at the refresh endpoint", async () => {
    installSessionTable();
    await installUser();
    const { body } = await login();

    const res = await api()
      .post("/api/v1/auth/session/refresh")
      .send({ refresh_token: body.data.access_token });
    expect(res.status).toBe(401);
  });

  it("rejects a wrong password without creating a session", async () => {
    installSessionTable();
    await installUser();
    const res = await api()
      .post("/api/v1/auth/login")
      .send({ phone: PHONE, password: "Wr0ng!pass" });
    expect(res.status).toBe(401);
    expect(fakeHasura.callsTo("InsertSession")).toHaveLength(0);
  });

  it("guest sessions also refresh successfully", async () => {
    installSessionTable();
    const guest = await api().post("/api/v1/auth/session/guest");
    expect(guest.status).toBe(201);

    const res = await api()
      .post("/api/v1/auth/session/refresh")
      .send({ refresh_token: guest.body.data.refresh_token });
    expect(res.status).toBe(200);
  });
});

describe("Hasura auth webhook", () => {
  const authorize = (token?: string) =>
    api()
      .post("/api/v1/auth/webhook/authorize")
      .send({ headers: token ? { "x-hasura-access-token": token } : {} });

  it("maps a valid access token to Hasura session variables", async () => {
    installSessionTable();
    await installUser();
    const { body } = await login();

    const res = await authorize(body.data.access_token);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      "X-Hasura-User-Id": "user-1",
      "X-Hasura-Role": "student",
      "X-Hasura-Session-Id": body.data.session_id,
    });
  });

  it("refuses a refresh token used as an access token", async () => {
    installSessionTable();
    await installUser();
    const { body } = await login();

    const res = await authorize(body.data.refresh_token);
    expect(res.status).toBe(401);
  });

  it("refuses requests with no token", async () => {
    expect((await authorize()).status).toBe(401);
  });
});
