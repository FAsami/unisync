import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

export const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "9201", 10),
  APP_VERSION: process.env.APP_VERSION || "1.0.0",

  // External Services
  SENTRY_DSN: process.env.SENTRY_DSN,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(","),

  // Hasura Configuration
  HASURA_ENDPOINT:
    process.env.HASURA_ENDPOINT || "http://localhost:9203/v1/graphql",
  HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || "123",

  // Shared secret Hasura sends (SERVER-AUTH-SECRET header) on actions and
  // event triggers. Must match SERVER_AUTH_SECRET in the Hasura environment.
  SERVER_AUTH_SECRET: process.env.SERVER_AUTH_SECRET,

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "longLongAgo",
  JWT_ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY || "1h",
  JWT_REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_TOKEN_EXPIRY || "30d",

  // OTP Configuration
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10),
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH || "6", 10),
  OTP_BCRYPT_ROUNDS: parseInt(process.env.OTP_BCRYPT_ROUNDS || "12", 10),

  // OTP Rate Limits
  OTP_SEND_LIMIT_PER_HOUR: parseInt(
    process.env.OTP_SEND_LIMIT_PER_HOUR || "3",
    10
  ),
  OTP_SEND_LIMIT_PER_IP_PER_HOUR: parseInt(
    process.env.OTP_SEND_LIMIT_PER_IP_PER_HOUR || "10",
    10
  ),

  // SMS Provider - BulkSMS Bangladesh
  BULK_SMS_API_KEY: process.env.BULK_SMS_API_KEY,
  BULK_SMS_SECRET_KEY: process.env.BULK_SMS_SECRET_KEY,
  BULK_SMS_CALLER_ID: process.env.BULK_SMS_CALLER_ID,
  BULK_SMS_ENDPOINT:
    process.env.BULK_SMS_ENDPOINT || "http://118.67.213.114:3775/sendtext",
} as const;

export type Config = typeof config;

export const validateConfig = (): void => {
  const requiredEnvVars = [
    "HASURA_ENDPOINT",
    "HASURA_ADMIN_SECRET",
    "JWT_SECRET",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  // Validate JWT_SECRET is strong enough (at least 32 characters in production)
  if (config.NODE_ENV === "production" && config.JWT_SECRET.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters in production"
    );
  }

  // Not fatal so a missing secret can't take the API down on deploy, but every
  // Hasura event/action endpoint will answer 503 until it is configured.
  if (!config.SERVER_AUTH_SECRET && config.NODE_ENV !== "test") {
    console.warn(
      "[config] SERVER_AUTH_SECRET is not set: Hasura webhook endpoints will reject all requests"
    );
  }
};

export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

export default config;
