/**
 * Configuration Types
 * Application configuration type definitions
 */

export interface EnvironmentConfig {
  // Server Configuration
  NODE_ENV: string;
  PORT: number;
  APP_VERSION: string;

  // External Services
  SENTRY_DSN?: string;
  ALLOWED_ORIGINS?: string[];

  // Hasura Configuration
  HASURA_ENDPOINT: string;
  HASURA_ADMIN_SECRET: string;

  // JWT Configuration
  JWT_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRY: string;
  JWT_REFRESH_TOKEN_EXPIRY: string;

  // OTP Configuration
  OTP_EXPIRY_MINUTES: number;
  OTP_LENGTH: number;
  OTP_BCRYPT_ROUNDS: number;

  // OTP Rate Limits
  OTP_SEND_LIMIT_PER_HOUR: number;
  OTP_SEND_LIMIT_PER_IP_PER_HOUR: number;

  // SMS Provider - BulkSMS Bangladesh
  BULK_SMS_API_KEY?: string;
  BULK_SMS_SECRET_KEY?: string;
  BULK_SMS_CALLER_ID?: string;
}
