import { config } from "../../src/config/environment";

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

describe("Environment Configuration", () => {
  describe("Server Configuration", () => {
    it("should use default port when PORT is not set", () => {
      delete process.env.PORT;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.PORT).toBe(9201);
    });

    it("should use custom port when PORT is set", () => {
      process.env.PORT = "4000";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.PORT).toBe(4000);
    });

    it("should use default environment when NODE_ENV is not set", () => {
      delete process.env.NODE_ENV;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.NODE_ENV).toBe("development");
    });

    it("should use custom environment when NODE_ENV is set", () => {
      process.env.NODE_ENV = "production";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.NODE_ENV).toBe("production");
    });
  });

  describe("JWT Configuration", () => {
    it("should use default JWT secret when not set", () => {
      delete process.env.JWT_SECRET;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.JWT_SECRET).toBe("longLongAgo");
    });

    it("should use custom JWT secret when set", () => {
      process.env.JWT_SECRET = "custom-jwt-secret";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.JWT_SECRET).toBe("custom-jwt-secret");
    });

    it("should use default JWT access token expiry when not set", () => {
      delete process.env.JWT_ACCESS_TOKEN_EXPIRY;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.JWT_ACCESS_TOKEN_EXPIRY).toBe("1h");
    });

    it("should use custom JWT access token expiry when set", () => {
      process.env.JWT_ACCESS_TOKEN_EXPIRY = "2h";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.JWT_ACCESS_TOKEN_EXPIRY).toBe("2h");
    });

    it("should use default JWT refresh token expiry when not set", () => {
      delete process.env.JWT_REFRESH_TOKEN_EXPIRY;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.JWT_REFRESH_TOKEN_EXPIRY).toBe("30d");
    });

    it("should use custom JWT refresh token expiry when set", () => {
      process.env.JWT_REFRESH_TOKEN_EXPIRY = "60d";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.JWT_REFRESH_TOKEN_EXPIRY).toBe("60d");
    });
  });

  describe("Hasura Configuration", () => {
    it("should use default Hasura endpoint when not set", () => {
      delete process.env.HASURA_ENDPOINT;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.HASURA_ENDPOINT).toBe(
        "http://localhost:9203/v1/graphql"
      );
    });

    it("should use custom Hasura endpoint when set", () => {
      process.env.HASURA_ENDPOINT = "https://api.example.com/graphql";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.HASURA_ENDPOINT).toBe(
        "https://api.example.com/graphql"
      );
    });

    it("should use default Hasura admin secret when not set", () => {
      delete process.env.HASURA_ADMIN_SECRET;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.HASURA_ADMIN_SECRET).toBe("123");
    });

    it("should use custom Hasura admin secret when set", () => {
      process.env.HASURA_ADMIN_SECRET = "custom-admin-secret";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.HASURA_ADMIN_SECRET).toBe("custom-admin-secret");
    });
  });

  describe("Rate Limiting Configuration", () => {
    it("should use default rate limit window when not set", () => {
      delete process.env.RATE_LIMIT_WINDOW_MS;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.RATE_LIMIT_WINDOW_MS).toBe(900000); // 15 minutes
    });

    it("should use custom rate limit window when set", () => {
      process.env.RATE_LIMIT_WINDOW_MS = "300000"; // 5 minutes

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.RATE_LIMIT_WINDOW_MS).toBe(300000);
    });

    it("should use default max requests when not set", () => {
      delete process.env.RATE_LIMIT_MAX_REQUESTS;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.RATE_LIMIT_MAX_REQUESTS).toBe(100);
    });

    it("should use custom max requests when set", () => {
      process.env.RATE_LIMIT_MAX_REQUESTS = "200";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.RATE_LIMIT_MAX_REQUESTS).toBe(200);
    });
  });

  describe("Logging Configuration", () => {
    it("should use default log level when not set", () => {
      delete process.env.LOG_LEVEL;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.LOG_LEVEL).toBe("info");
    });

    it("should use custom log level when set", () => {
      process.env.LOG_LEVEL = "debug";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.LOG_LEVEL).toBe("debug");
    });

    it("should use default log file enabled when not set", () => {
      delete process.env.LOG_FILE_ENABLED;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.LOG_FILE_ENABLED).toBe(true);
    });

    it("should disable log file when LOG_FILE_ENABLED is false", () => {
      process.env.LOG_FILE_ENABLED = "false";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.LOG_FILE_ENABLED).toBe(false);
    });
  });

  describe("Sentry Configuration", () => {
    it("should use default Sentry DSN when not set", () => {
      delete process.env.SENTRY_DSN;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.SENTRY_DSN).toBe(
        "https://8e85f06a4a781f26e7ffdebd35cfef33@o4508676239327232.ingest.us.sentry.io/4509696729677824"
      );
    });

    it("should use custom Sentry DSN when set", () => {
      process.env.SENTRY_DSN = "https://sentry.example.com/dsn";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.SENTRY_DSN).toBe("https://sentry.example.com/dsn");
    });
  });

  describe("CORS Configuration", () => {
    it("should use default allowed origins when not set", () => {
      delete process.env.ALLOWED_ORIGINS;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.ALLOWED_ORIGINS).toEqual([
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
      ]);
    });

    it("should use custom allowed origins when set", () => {
      process.env.ALLOWED_ORIGINS =
        "https://app.example.com,https://api.example.com";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.ALLOWED_ORIGINS).toEqual([
        "https://app.example.com",
        "https://api.example.com",
      ]);
    });
  });

  describe("API Configuration", () => {
    it("should use default API version when not set", () => {
      delete process.env.API_VERSION;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.API_VERSION).toBe("v1");
    });

    it("should use custom API version when set", () => {
      process.env.API_VERSION = "v2";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.API_VERSION).toBe("v2");
    });

    it("should use default app version when not set", () => {
      delete process.env.APP_VERSION;

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.APP_VERSION).toBe("1.0.0");
    });

    it("should use custom app version when set", () => {
      process.env.APP_VERSION = "2.0.0";

      const { config: testConfig } = require("../../src/config/environment");

      expect(testConfig.APP_VERSION).toBe("2.0.0");
    });
  });

  describe("Configuration Validation", () => {
    it("should validate required environment variables", () => {
      // Test that the config object has all required properties
      expect(config).toHaveProperty("NODE_ENV");
      expect(config).toHaveProperty("PORT");
      expect(config).toHaveProperty("JWT_SECRET");
      expect(config).toHaveProperty("HASURA_ENDPOINT");
      expect(config).toHaveProperty("RATE_LIMIT_WINDOW_MS");
      expect(config).toHaveProperty("LOG_LEVEL");
      expect(config).toHaveProperty("SENTRY_DSN");
      expect(config).toHaveProperty("ALLOWED_ORIGINS");
      expect(config).toHaveProperty("API_VERSION");
      expect(config).toHaveProperty("APP_VERSION");
    });

    it("should have correct configuration structure", () => {
      expect(typeof config.NODE_ENV).toBe("string");
      expect(typeof config.PORT).toBe("number");
      expect(typeof config.JWT_SECRET).toBe("string");
      expect(typeof config.HASURA_ENDPOINT).toBe("string");
      expect(typeof config.RATE_LIMIT_WINDOW_MS).toBe("number");
      expect(typeof config.RATE_LIMIT_MAX_REQUESTS).toBe("number");
      expect(typeof config.LOG_LEVEL).toBe("string");
      expect(typeof config.LOG_FILE_ENABLED).toBe("boolean");
      expect(typeof config.API_VERSION).toBe("string");
      expect(typeof config.APP_VERSION).toBe("string");
      expect(Array.isArray(config.ALLOWED_ORIGINS)).toBe(true);
    });
  });
});
