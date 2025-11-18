/**
 * OTP Zod Schemas
 * Validation schemas for OTP operations
 */

import { z } from "zod";
import { emailSchema, otpCodeSchema } from "./common.schema";

/**
 * OTP purpose enum
 */
export const otpPurposeSchema = z.enum(["LOGIN", "SIGNUP", "PASSWORD_RESET"], {
  message: "Invalid purpose. Must be LOGIN, SIGNUP, or PASSWORD_RESET",
});

/**
 * Identifier type enum
 */
export const identifierTypeSchema = z.enum(["EMAIL", "PHONE"], {
  message: "Invalid identifier type. Must be EMAIL or PHONE",
});

/**
 * Send OTP schema
 */
export const sendOTPSchema = z
  .object({
    identifier: z.string().trim().min(1, "Identifier is required"),
    identifierType: z.string().trim().toUpperCase().pipe(identifierTypeSchema),
    purpose: z.string().trim().toUpperCase().pipe(otpPurposeSchema),
  })
  .refine(
    (data) => {
      const trimmedIdentifier = data.identifier.trim();
      if (data.identifierType === "EMAIL") {
        return emailSchema.safeParse(trimmedIdentifier).success;
      } else if (data.identifierType === "PHONE") {
        const e164Pattern = /^\+[1-9]\d{1,14}$/;
        return e164Pattern.test(trimmedIdentifier);
      }
      return false;
    },
    {
      message: "Invalid identifier format for the specified type",
      path: ["identifier"],
    }
  )
  .transform((data) => {
    if (data.identifierType === "EMAIL") {
      return {
        ...data,
        identifier: data.identifier.trim().toLowerCase(),
      };
    } else if (data.identifierType === "PHONE") {
      return {
        ...data,
        identifier: data.identifier.trim().replace(/\s+/g, ""),
      };
    }
    return data;
  });

/**
 * Verify OTP schema
 */
export const verifyOTPSchema = z.object({
  identifier: z.string().trim().min(1, "Identifier is required"),
  otp: otpCodeSchema,
  purpose: otpPurposeSchema,
});

/**
 * Type exports (inferred from schemas)
 */
export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type OTPPurpose = z.infer<typeof otpPurposeSchema>;
export type IdentifierType = z.infer<typeof identifierTypeSchema>;
