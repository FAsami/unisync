/**
 * Common Zod Schemas
 * Reusable schema components for validation
 */

import { z } from "zod";
import { config } from "../config/environment";

/**
 * Phone number schema with E.164 format validation
 */
export const phoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      const e164Pattern = /^\+[1-9]\d{1,14}$/;
      const flexiblePattern = /^[+]?\d{8,20}$/;
      return e164Pattern.test(value) || flexiblePattern.test(value);
    },
    { message: "Invalid phone number" }
  )
  .transform((value) => {
    return value.trim().replace(/\s+/g, "");
  });

/**
 * Strict phone number schema requiring valid E.164 format
 */
export const strictPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      const e164Pattern = /^\+[1-9]\d{1,14}$/;
      return e164Pattern.test(value);
    },
    {
      message:
        "Invalid phone number format. Use E.164 format (e.g., +14155552671)",
    }
  )
  .transform((value) => {
    return value.trim().replace(/\s+/g, "");
  });

/**
 * Email schema
 */
export const emailSchema = z.string().email({
  message: "Invalid email format",
});

/**
 * Password schema with security requirements
 * - Minimum 8 characters
 * - Maximum 128 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

/**
 * OTP code schema
 */
export const otpCodeSchema = z
  .string()
  .trim()
  .regex(
    new RegExp(`^\\d{${config.OTP_LENGTH}}$`),
    `Invalid OTP format. Must be ${config.OTP_LENGTH} digits`
  );

/**
 * Flexible OTP code schema (4-8 digits)
 */
export const flexibleOtpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{4,8}$/, "Invalid OTP format. Must be 4-8 digits");
