import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),

  // Sentry Configuration
  SENTRY_DSN: process.env.SENTRY_DSN,

  // CORS Configuration
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ],

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10
  ), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_ENABLED: process.env.LOG_FILE_ENABLED !== "false",

  // API Version
  API_VERSION: process.env.API_VERSION || "v1",
  // App Version (for Sentry releases)
  APP_VERSION: process.env.APP_VERSION || "1.0.0",
} as const;

// Type for the config object
export type Config = typeof config;

// Validation function
export const validateConfig = (): void => {
  const requiredEnvVars: string[] = [
    // Add required environment variables here when needed
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};

// Environment-specific configurations
export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

export default config;
