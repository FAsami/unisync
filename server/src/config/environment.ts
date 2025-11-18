import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

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
};

export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

export default config;
