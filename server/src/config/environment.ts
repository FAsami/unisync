import dotenv from "dotenv";

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  SENTRY_DSN: process.env.SENTRY_DSN,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ],
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_ENABLED: process.env.LOG_FILE_ENABLED !== "false",
  API_VERSION: process.env.API_VERSION || "v1",
  APP_VERSION: process.env.APP_VERSION || "1.0.0",
  HASURA_ENDPOINT:
    process.env.HASURA_ENDPOINT || "http://localhost:8080/v1/graphql",
  HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET,
  JWT_SECRET: process.env.JWT_SECRET || "longLongAgo",
  JWT_ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY || "1h",
  JWT_REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_TOKEN_EXPIRY || "30d",
} as const;

export type Config = typeof config;

export const validateConfig = (): void => {
  const requiredEnvVars: string[] = [];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};

export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

export default config;
