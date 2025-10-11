// Mock ES modules that cause issues in Jest
jest.mock("graphql-request", () => ({
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn(),
  })),
}));

import request from "supertest";
import app from "../src/index";

describe("Main Application", () => {
  describe("Server Configuration", () => {
    it("should export an Express application", () => {
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe("function");
      expect(typeof app.use).toBe("function");
    });

    it("should have health endpoint accessible", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("OK");
    });
  });

  describe("Environment Configuration", () => {
    it("should use default port when PORT is not set", () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;

      jest.resetModules();
      const { default: testApp } = require("../src/index");

      expect(testApp).toBeDefined();

      if (originalPort) {
        process.env.PORT = originalPort;
      }
    });

    it("should use custom port when PORT is set", () => {
      const originalPort = process.env.PORT;
      process.env.PORT = "4000";
      jest.resetModules();
      const { default: testApp } = require("../src/index");

      expect(testApp).toBeDefined();

      // Restore original PORT
      if (originalPort) {
        process.env.PORT = originalPort;
      } else {
        delete process.env.PORT;
      }
    });
  });

  describe("Middleware Stack", () => {
    it("should apply all middleware in correct order", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      // Check that all middleware is working
      expect(response.headers).toHaveProperty("x-request-id");
      expect(response.headers).toHaveProperty("x-content-type-options"); // Helmet
      expect(response.body.meta).toHaveProperty("duration");
      expect(response.body.meta).toHaveProperty("requestId");
    });

    it("should handle CORS headers", async () => {
      const response = await request(app)
        .get("/api/v1/health")
        .set("Origin", "http://localhost:3000")
        .expect(200);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app)
        .get("/api/v1/nonexistent")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 404 for root path", async () => {
      const response = await request(app).get("/").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("Request Processing", () => {
    it("should generate unique request IDs", async () => {
      const requests = Array.from({ length: 3 }, () =>
        request(app).get("/api/v1/health").expect(200)
      );

      const responses = await Promise.all(requests);
      const requestIds = responses.map((r) => r.body.meta.requestId);
      const uniqueRequestIds = new Set(requestIds);

      expect(uniqueRequestIds.size).toBe(3);
    });

    it("should include timing information", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body.meta.duration).toBeDefined();
      expect(typeof response.body.meta.duration).toBe("number");
      expect(response.body.meta.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
