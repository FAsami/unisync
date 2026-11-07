import { describe, it, expect } from "vitest";
import { parse, visit } from "graphql";
import { api, SERVER_SECRET } from "./helpers/app";
import { fakeHasura } from "./helpers/fakeHasura";

const event = (newRow: Record<string, unknown>) => ({
  event: { op: "INSERT", data: { old: null, new: newRow } },
  table: { name: "log", schema: "notification" },
});

const declaredAndUsedVariables = (document: string) => {
  const declared = new Set<string>();
  const used = new Set<string>();
  visit(parse(document), {
    VariableDefinition(node) {
      declared.add(node.variable.name.value);
      return false;
    },
    Variable(node) {
      used.add(node.name.value);
    },
  });
  return { declared, used };
};

describe("Hasura event webhook /webhook/events/send-notification", () => {
  it("rejects calls without the shared server secret", async () => {
    const res = await api()
      .post("/api/v1/webhook/events/send-notification")
      .send(event({ id: "n-1", target_type: "all" }));
    expect(res.status).toBe(401);
    expect(fakeHasura.calls).toHaveLength(0);
  });

  it("rejects calls with a wrong secret", async () => {
    const res = await api()
      .post("/api/v1/webhook/events/send-notification")
      .set("SERVER-AUTH-SECRET", "nope")
      .send(event({ id: "n-1", target_type: "all" }));
    expect(res.status).toBe(401);
  });

  it("broadcasts to all users with a query Hasura will accept", async () => {
    fakeHasura
      .on("UpdateStatus", () => ({ update_notification_log_by_pk: { id: "n-1" } }))
      .on("GetTargetUsers", () => ({ users: [{ id: "u-1" }] }))
      .on("UpdateStatusComplete", () => ({ update_notification_log_by_pk: { id: "n-1" } }));

    const res = await api()
      .post("/api/v1/webhook/events/send-notification")
      .set("SERVER-AUTH-SECRET", SERVER_SECRET)
      .send(event({ id: "n-1", target_type: "all", title: "t", body: "b" }));

    expect(res.status).toBe(200);
    const [call] = fakeHasura.callsTo("GetTargetUsers");
    const { declared } = declaredAndUsedVariables(call.document);
    // Every declared variable must be supplied, or Hasura rejects the query
    // (this used to declare a required $targetType that was never sent).
    for (const name of declared) {
      expect(call.variables).toHaveProperty(name);
    }
    expect(call.document).toContain("deleted_at");
  });

  it("marks the notification failed when no users match", async () => {
    fakeHasura
      .on("UpdateStatus", () => ({ update_notification_log_by_pk: { id: "n-2" } }))
      .on("GetSectionUsers", () => ({ users: [] }))
      .on("UpdateStatusNoUsers", () => ({ update_notification_log_by_pk: { id: "n-2" } }));

    const res = await api()
      .post("/api/v1/webhook/events/send-notification")
      .set("SERVER-AUTH-SECRET", SERVER_SECRET)
      .send(event({ id: "n-2", target_type: "section", target_id: "s-1" }));

    expect(res.status).toBe(200);
    expect(fakeHasura.callsTo("UpdateStatusNoUsers")[0].variables.status).toBe("failed");
  });
});

describe("/notification/send", () => {
  it("is not callable by anonymous clients", async () => {
    const res = await api()
      .post("/api/v1/notification/send")
      .send({ userId: "00000000-0000-4000-8000-000000000000", title: "x", body: "y" });
    expect(res.status).toBe(401);
    expect(fakeHasura.calls).toHaveLength(0);
  });
});

describe("health", () => {
  it("responds with the standard envelope", async () => {
    const res = await api().get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: { status: "OK" } });
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  it("returns the standard 404 envelope for unknown routes", async () => {
    const res = await api().get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
