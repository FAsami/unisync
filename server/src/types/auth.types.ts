/**
 * Authentication & Authorization Types
 * JWT, session, and auth-related type definitions
 */

export type UserRole =
  | "guest-consumer"
  | "consumer"
  | "student"
  | "teacher"
  | "admin"
  | "class_representative";

export interface TokenPayload {
  sessionId: string;
  userId: string | null;
  role: UserRole;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export interface AuthOptions {
  requireAuth?: boolean;
  allowGuest?: boolean;
  requireUser?: boolean;
}

export interface SessionData {
  id: string;
  user_id?: number | null;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  revoked: boolean;
  ip_address: string;
  user_agent: string;
  last_used_at: string;
  created_at: string;
  updated_at: string;
  device_info?: any;
}

export interface UserAccountData {
  id: string;
  phone: string;
  email?: string | null;
  password: string;
  phone_verified_at: string | null;
  email_verified_at?: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}
