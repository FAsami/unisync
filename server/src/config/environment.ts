import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "9201", 10),
  SENTRY_DSN: process.env.SENTRY_DSN,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(","),
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
    process.env.HASURA_ENDPOINT || "http://localhost:9203/v1/graphql",
  HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || "123",
  JWT_SECRET: process.env.JWT_SECRET || "longLongAgo",
  JWT_ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY || "1h",
  JWT_REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_TOKEN_EXPIRY || "30d",

  // OTP Configuration
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10),
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
  OTP_VERIFY_LIMIT_PER_15MIN: parseInt(
    process.env.OTP_VERIFY_LIMIT_PER_15MIN || "5",
    10
  ),

  // Email Provider Configuration
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "console", // console, resend, sendgrid, ses
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
  AWS_SES_REGION: process.env.AWS_SES_REGION,
  AWS_SES_FROM_EMAIL: process.env.AWS_SES_FROM_EMAIL,

  // SMS Provider Configuration
  SMS_PROVIDER: process.env.SMS_PROVIDER || "console", // console, twilio, sns
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
  AWS_SNS_REGION: process.env.AWS_SNS_REGION,
} as const;
console.log("[config]", config);

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
