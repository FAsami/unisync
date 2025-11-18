/**
 * Authentication Zod Schemas
 * Validation schemas for auth-related operations
 */

import { z } from "zod";
import {
  phoneSchema,
  emailSchema,
  passwordSchema,
  flexibleOtpCodeSchema,
} from "./common.schema";

/**
 * User registration schema
 */
export const registerSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  email: emailSchema.optional().nullable(),
});

/**
 * Registration verification schema
 */
export const verifyRegistrationSchema = z.object({
  phone: phoneSchema,
  otp: flexibleOtpCodeSchema,
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Password reset request schema
 */
export const resetPasswordRequestSchema = z.object({
  phone: phoneSchema,
});

/**
 * Password reset verification schema
 */
export const resetPasswordVerifySchema = z.object({
  phone: phoneSchema,
  otp: flexibleOtpCodeSchema,
  newPassword: passwordSchema,
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

/**
 * Type exports (inferred from schemas)
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyRegistrationInput = z.infer<typeof verifyRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordRequestInput = z.infer<
  typeof resetPasswordRequestSchema
>;
export type ResetPasswordVerifyInput = z.infer<
  typeof resetPasswordVerifySchema
>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
