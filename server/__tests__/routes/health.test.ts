import request from "supertest";
import express from "express";
import { healthRouter } from "../../src/routes/health";
import { requestInfo } from "../../src/middleware/requestInfo";

describe("Health Route", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(requestInfo);
    app.use("/api/v1", healthRouter);
  });

  describe("GET /api/v1/health", () => {
    it("should return health status with correct structure", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: "OK",
          uptime: expect.any(Number),
          environment: expect.any(String),
          version: "1.0.0",
        },
        message: "Server is healthy",
        meta: {
          timestamp: expect.any(String),
          path: "/api/v1/health",
          method: "GET",
          requestId: expect.any(String),
          duration: expect.any(Number),
        },
      });
    });

    it("should include proper health data", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      const { data } = response.body;

      expect(data.status).toBe("OK");
      expect(data.uptime).toBeGreaterThan(0);
      expect(data.environment).toBe("test"); // Set in setup.ts
      expect(data.version).toBe("1.0.0");
    });

    it("should include request ID in headers", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.headers["x-request-id"]).toBeDefined();
      expect(typeof response.headers["x-request-id"]).toBe("string");
      expect(response.body.meta.requestId).toBe(
        response.headers["x-request-id"]
      );
    });

    it("should include duration in response", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body.meta.duration).toBeDefined();
      expect(typeof response.body.meta.duration).toBe("number");
      expect(response.body.meta.duration).toBeGreaterThanOrEqual(0);
    });

    it("should use existing request ID when provided", async () => {
      const customRequestId = "custom-request-id-123";

      const response = await request(app)
        .get("/api/v1/health")
        .set("x-request-id", customRequestId)
        .expect(200);

      expect(response.headers["x-request-id"]).toBe(customRequestId);
      expect(response.body.meta.requestId).toBe(customRequestId);
    });

    it("should handle different environments", async () => {
      // Temporarily change environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body.data.environment).toBe("production");

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it("should return valid timestamp", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      const timestamp = response.body.meta.timestamp;
      expect(timestamp).toBeDefined();
      expect(typeof timestamp).toBe("string");
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it("should handle multiple concurrent requests", async () => {
      const requests = Array.from({ length: 5 }, () =>
        request(app).get("/api/v1/health").expect(200)
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe("OK");
        expect(response.body.meta.requestId).toBeDefined();
      });

      // All request IDs should be unique
      const requestIds = responses.map((r) => r.body.meta.requestId);
      const uniqueRequestIds = new Set(requestIds);
      expect(uniqueRequestIds.size).toBe(5);
    });
  });

  describe("Health data validation", () => {
    it("should have uptime as a positive number", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body.data.uptime).toBeGreaterThan(0);
      expect(typeof response.body.data.uptime).toBe("number");
    });

    it("should have environment as a string", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(typeof response.body.data.environment).toBe("string");
      expect(response.body.data.environment.length).toBeGreaterThan(0);
    });

    it("should have version as a string", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(typeof response.body.data.version).toBe("string");
      expect(response.body.data.version).toBe("1.0.0");
    });
  });
});
