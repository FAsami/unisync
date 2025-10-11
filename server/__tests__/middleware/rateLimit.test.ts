import request from "supertest";
import express, { Express } from "express";
import rateLimit from "express-rate-limit";

describe("Rate Limiting Middleware", () => {
  let app: Express;

  describe("authLimiter", () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());

      // Create fresh limiter for each test
      const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res.status(429).json({
            success: false,
            message:
              "Too many authentication attempts, please try again later.",
            retryAfter: "15 minutes",
          });
        },
      });

      app.use("/api/v1/auth", authLimiter);
      app.post("/api/v1/auth/test", (req, res) => {
        res.json({ success: true, message: "Auth endpoint" });
      });
    });

    it("should allow requests below limit (5 requests)", async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post("/api/v1/auth/test")
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    it("should block 6th request with 429 status", async () => {
      // Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/v1/auth/test").expect(200);
      }

      // 6th request should be rate limited
      const response = await request(app).post("/api/v1/auth/test").expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Too many authentication attempts"
      );
    });

    it("should include rate limit headers", async () => {
      const response = await request(app).post("/api/v1/auth/test").expect(200);

      expect(response.headers["ratelimit-limit"]).toBe("5");
      expect(response.headers["ratelimit-remaining"]).toBeDefined();
      expect(response.headers["ratelimit-reset"]).toBeDefined();
    });

    it("should include retry-after in error response", async () => {
      // Hit rate limit
      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/v1/auth/test");
      }

      const response = await request(app).post("/api/v1/auth/test").expect(429);

      expect(response.body.retryAfter).toBe("15 minutes");
    });

    it("should decrement remaining count with each request", async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post("/api/v1/auth/test")
          .expect(200);

        const remaining = parseInt(response.headers["ratelimit-remaining"]);
        expect(remaining).toBe(4 - i);
      }
    });
  });

  describe("apiLimiter", () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());

      const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res.status(429).json({
            success: false,
            message:
              "Too many API requests from this IP, please try again later.",
            retryAfter: "15 minutes",
          });
        },
      });

      app.use("/api/v1", apiLimiter);
      app.get("/api/v1/test", (req, res) => {
        res.json({ success: true, message: "API endpoint" });
      });
    });

    it("should allow up to 50 requests", async () => {
      for (let i = 0; i < 50; i++) {
        await request(app).get("/api/v1/test").expect(200);
      }
    });

    it("should block 51st request with 429", async () => {
      // Make 50 successful requests
      for (let i = 0; i < 50; i++) {
        await request(app).get("/api/v1/test").expect(200);
      }

      // 51st request should be rate limited
      const response = await request(app).get("/api/v1/test").expect(429);

      expect(response.body.message).toContain("Too many API requests");
    });

    it("should have correct rate limit headers", async () => {
      const response = await request(app).get("/api/v1/test").expect(200);

      expect(response.headers["ratelimit-limit"]).toBe("50");
    });
  });

  describe("generalLimiter", () => {
    beforeEach(() => {
      app = express();

      const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res.status(429).json({
            success: false,
            message: "Too many requests from this IP, please try again later.",
            retryAfter: "15 minutes",
          });
        },
      });

      app.use(generalLimiter);
      app.get("/test", (req, res) => {
        res.json({ success: true });
      });
    });

    it("should allow up to 100 requests", async () => {
      for (let i = 0; i < 100; i++) {
        await request(app).get("/test").expect(200);
      }
    });

    it("should block 101st request", async () => {
      for (let i = 0; i < 100; i++) {
        await request(app).get("/test").expect(200);
      }

      const response = await request(app).get("/test").expect(429);
      expect(response.body.message).toContain("Too many requests");
    });
  });

  describe("webhookLimiter", () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());

      const webhookLimiter = rateLimit({
        windowMs: 1 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res.status(429).json({
            success: false,
            message: "Too many webhook requests, please try again later.",
            retryAfter: "1 second",
          });
        },
      });

      app.use("/webhook", webhookLimiter);
      app.post("/webhook", (req, res) => {
        res.json({ success: true });
      });
    });

    it("should allow up to 100 requests per second", async () => {
      const requests = Array.from({ length: 100 }, () =>
        request(app).post("/webhook").send({})
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter((r) => r.status === 200).length;

      expect(successCount).toBe(100);
    });

    it("should block requests over 100 per second", async () => {
      const requests = Array.from({ length: 105 }, () =>
        request(app).post("/webhook").send({})
      );

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;

      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  describe("healthLimiter", () => {
    beforeEach(() => {
      app = express();

      const healthLimiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res.status(429).json({
            success: false,
            message: "Too many health check requests, please try again later.",
            retryAfter: "1 minute",
          });
        },
      });

      app.use("/health", healthLimiter);
      app.get("/health", (req, res) => {
        res.json({ status: "ok" });
      });
    });

    it("should allow up to 30 requests per minute", async () => {
      for (let i = 0; i < 30; i++) {
        await request(app).get("/health").expect(200);
      }
    });

    it("should block 31st request in same minute", async () => {
      for (let i = 0; i < 30; i++) {
        await request(app).get("/health").expect(200);
      }

      const response = await request(app).get("/health").expect(429);
      expect(response.body.message).toContain("Too many health check requests");
    });
  });

  describe("Different endpoints have different limits", () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());

      const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res
            .status(429)
            .json({
              success: false,
              message: "Too many authentication attempts",
            });
        },
      });

      const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res
            .status(429)
            .json({ success: false, message: "Too many API requests" });
        },
      });

      // Apply different limiters to different routes
      app.use("/api/v1/auth", authLimiter);
      app.use("/api/v1", apiLimiter);

      app.post("/api/v1/auth/test", (req, res) => {
        res.json({ endpoint: "auth" });
      });

      app.get("/api/v1/data", (req, res) => {
        res.json({ endpoint: "api" });
      });
    });

    it("should apply strict limit to auth endpoint (5 requests)", async () => {
      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/v1/auth/test").expect(200);
      }

      await request(app).post("/api/v1/auth/test").expect(429);
    });

    it("should apply moderate limit to API endpoint (50 requests)", async () => {
      for (let i = 0; i < 50; i++) {
        await request(app).get("/api/v1/data").expect(200);
      }

      await request(app).get("/api/v1/data").expect(429);
    });

    it("should not affect other endpoints when one is rate limited", async () => {
      // Max out auth endpoint
      for (let i = 0; i < 6; i++) {
        await request(app).post("/api/v1/auth/test");
      }

      // API endpoint should still work
      const response = await request(app).get("/api/v1/data").expect(200);
      expect(response.body.endpoint).toBe("api");
    });
  });

  describe("Rate limit headers", () => {
    beforeEach(() => {
      app = express();

      const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res
            .status(429)
            .json({ success: false, message: "Too many attempts" });
        },
      });

      app.use("/test", authLimiter);
      app.get("/test", (req, res) => {
        res.json({ success: true });
      });
    });

    it("should include standard rate limit headers", async () => {
      const response = await request(app).get("/test").expect(200);

      expect(response.headers).toHaveProperty("ratelimit-limit");
      expect(response.headers).toHaveProperty("ratelimit-remaining");
      expect(response.headers).toHaveProperty("ratelimit-reset");
    });

    it("should not include legacy X-RateLimit headers", async () => {
      const response = await request(app).get("/test").expect(200);

      expect(response.headers).not.toHaveProperty("x-ratelimit-limit");
      expect(response.headers).not.toHaveProperty("x-ratelimit-remaining");
    });

    it("should show decreasing remaining count", async () => {
      const responses = [];
      for (let i = 0; i < 3; i++) {
        responses.push(await request(app).get("/test").expect(200));
      }

      const remaining0 = parseInt(responses[0].headers["ratelimit-remaining"]);
      const remaining1 = parseInt(responses[1].headers["ratelimit-remaining"]);
      const remaining2 = parseInt(responses[2].headers["ratelimit-remaining"]);

      expect(remaining0).toBeGreaterThan(remaining1);
      expect(remaining1).toBeGreaterThan(remaining2);
    });

    it("should show 0 remaining when rate limited", async () => {
      // Hit rate limit
      for (let i = 0; i < 5; i++) {
        await request(app).get("/test");
      }

      const response = await request(app).get("/test").expect(429);
      const remaining = parseInt(response.headers["ratelimit-remaining"]);

      expect(remaining).toBe(0);
    });
  });

  describe("Error response format", () => {
    beforeEach(() => {
      app = express();

      const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res.status(429).json({
            success: false,
            message:
              "Too many authentication attempts, please try again later.",
            retryAfter: "15 minutes",
          });
        },
      });

      app.use("/test", authLimiter);
      app.get("/test", (req, res) => {
        res.json({ success: true });
      });
    });

    it("should return proper error structure when rate limited", async () => {
      // Hit rate limit
      for (let i = 0; i < 5; i++) {
        await request(app).get("/test");
      }

      const response = await request(app).get("/test").expect(429);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("retryAfter");
      expect(response.body.message).toContain("Too many");
    });

    it("should return JSON content-type", async () => {
      // Hit rate limit
      for (let i = 0; i < 5; i++) {
        await request(app).get("/test");
      }

      const response = await request(app).get("/test").expect(429);

      expect(response.headers["content-type"]).toContain("application/json");
    });
  });

  describe("Different IP addresses have separate limits", () => {
    beforeEach(() => {
      app = express();
      app.set("trust proxy", true);

      const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res
            .status(429)
            .json({ success: false, message: "Too many attempts" });
        },
      });

      app.use("/test", authLimiter);
      app.get("/test", (req, res) => {
        res.json({ success: true });
      });
    });

    it("should track rate limits per IP", async () => {
      // Requests from IP 1
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get("/test")
          .set("X-Forwarded-For", "1.1.1.1")
          .expect(200);
      }

      // IP 1 should be rate limited
      await request(app)
        .get("/test")
        .set("X-Forwarded-For", "1.1.1.1")
        .expect(429);

      // IP 2 should still work
      await request(app)
        .get("/test")
        .set("X-Forwarded-For", "2.2.2.2")
        .expect(200);
    });
  });

  describe("HTTP methods", () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());

      const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          res
            .status(429)
            .json({ success: false, message: "Too many attempts" });
        },
      });

      app.use("/test", authLimiter);

      app.get("/test", (req, res) => res.json({ method: "GET" }));
      app.post("/test", (req, res) => res.json({ method: "POST" }));
      app.put("/test", (req, res) => res.json({ method: "PUT" }));
      app.delete("/test", (req, res) => res.json({ method: "DELETE" }));
    });

    it("should rate limit all HTTP methods together", async () => {
      // Mix of different methods, all count toward same limit
      await request(app).get("/test").expect(200);
      await request(app).post("/test").expect(200);
      await request(app).put("/test").expect(200);
      await request(app).delete("/test").expect(200);
      await request(app).get("/test").expect(200);

      // 6th request (any method) should be rate limited
      await request(app).post("/test").expect(429);
      await request(app).get("/test").expect(429);
    });
  });
});
