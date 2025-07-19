import request from "supertest";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "../../src/routes/health";
import { errorHandler } from "../../src/middleware/errorHandler";
import { notFoundHandler } from "../../src/middleware/notFoundHandler";
import { requestInfo } from "../../src/middleware/requestInfo";

describe("Application Integration Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();

    app.use(helmet());
    app.use(cors());
    app.use(requestInfo);
    app.use(morgan("combined"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/api/v1", healthRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  describe("Health Endpoint Integration", () => {
    it("should return health status with all middleware applied", async () => {
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

      // Check that security headers are applied
      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers).toHaveProperty("x-xss-protection");
    });

    it("should handle CORS preflight requests", async () => {
      const response = await request(app)
        .options("/api/v1/health")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "GET")
        .set("Access-Control-Request-Headers", "Content-Type")
        .expect(204);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle 404 errors for non-existent routes", async () => {
      const response = await request(app)
        .get("/api/v1/nonexistent")
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        data: null,
        error: {
          message: "Route /api/v1/nonexistent not found",
          code: "NOT_FOUND",
        },
        meta: {
          timestamp: expect.any(String),
          path: "/api/v1/nonexistent",
          method: "GET",
          requestId: expect.any(String),
          duration: expect.any(Number),
        },
      });
    });

    it("should handle 404 errors for root path", async () => {
      const response = await request(app).get("/").expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: "Route / not found",
          code: "NOT_FOUND",
        },
      });
    });

    it("should handle different HTTP methods for non-existent routes", async () => {
      const methods = ["POST", "PUT", "DELETE", "PATCH"];

      for (const method of methods) {
        let response;
        switch (method) {
          case "POST":
            response = await request(app)
              .post("/api/v1/nonexistent")
              .expect(404);
            break;
          case "PUT":
            response = await request(app)
              .put("/api/v1/nonexistent")
              .expect(404);
            break;
          case "DELETE":
            response = await request(app)
              .delete("/api/v1/nonexistent")
              .expect(404);
            break;
          case "PATCH":
            response = await request(app)
              .patch("/api/v1/nonexistent")
              .expect(404);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        expect(response.body.error.message).toBe(
          `Route /api/v1/nonexistent not found`
        );
        expect(response.body.meta.method).toBe(method);
      }
    });
  });

  describe("Request Processing Integration", () => {
    it("should process request with custom request ID", async () => {
      const customRequestId = "integration-test-123";

      const response = await request(app)
        .get("/api/v1/health")
        .set("x-request-id", customRequestId)
        .expect(200);

      expect(response.headers["x-request-id"]).toBe(customRequestId);
      expect(response.body.meta.requestId).toBe(customRequestId);
    });

    it("should generate unique request IDs for different requests", async () => {
      const requests = Array.from({ length: 3 }, () =>
        request(app).get("/api/v1/health").expect(200)
      );

      const responses = await Promise.all(requests);
      const requestIds = responses.map((r) => r.body.meta.requestId);
      const uniqueRequestIds = new Set(requestIds);

      expect(uniqueRequestIds.size).toBe(3);
    });

    it("should include proper timing information", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body.meta.duration).toBeDefined();
      expect(typeof response.body.meta.duration).toBe("number");
      expect(response.body.meta.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Security Integration", () => {
    it("should apply security headers", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);
      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers).toHaveProperty("x-xss-protection");
      expect(response.headers).toHaveProperty("x-dns-prefetch-control");
    });

    it("should handle CORS properly", async () => {
      const response = await request(app)
        .get("/api/v1/health")
        .set("Origin", "http://localhost:3000")
        .expect(200);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });
  });

  describe("JSON Parsing Integration", () => {
    it("should parse JSON request bodies", async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post("/test", (req, res) => {
        res.json({ received: req.body });
      });

      const testData = { test: "data", number: 123 };

      const response = await request(testApp)
        .post("/test")
        .send(testData)
        .expect(200);

      expect(response.body.received).toEqual(testData);
    });
  });

  describe("URL Encoding Integration", () => {
    it("should parse URL-encoded request bodies", async () => {
      const testApp = express();
      testApp.use(express.urlencoded({ extended: true }));
      testApp.post("/test", (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(testApp)
        .post("/test")
        .type("form")
        .send("name=test&value=123")
        .expect(200);

      expect(response.body.received).toEqual({
        name: "test",
        value: "123",
      });
    });
  });
});
