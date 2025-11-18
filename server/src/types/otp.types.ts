/**
 * OTP (One-Time Password) Types
 * OTP delivery, verification, and rate limiting types
 */

export type OTPPurpose = "LOGIN" | "SIGNUP" | "PASSWORD_RESET";
export type IdentifierType = "EMAIL" | "PHONE";
export type OTPActionType = "SEND" | "VERIFY";

export interface OTPTransactionData {
  id: string;
  identifier: string;
  identifier_type: IdentifierType;
  purpose: OTPPurpose;
  otp_hash: string;
  expires_at: string;
  verified_at?: string | null;
  attempt_count: number;
  created_at: string;
  updated_at: string;
}

export interface RateLimitData {
  identifier: string;
  identifierType: string;
  actionType: OTPActionType;
  ipAddress: string;
  currentWindowRecord?: RateLimitRecord;
}

export interface RateLimitRecord {
  id: string;
  identifier: string;
  action_type: OTPActionType;
  attempt_count: number;
  window_start: string;
  ip_address?: string;
  created_at: string;
}

export interface RateLimitConfig {
  maxAttempts: number;
  maxAttemptsPerIP?: number;
  windowMs: number;
}
