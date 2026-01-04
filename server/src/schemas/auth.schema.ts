/**
 * Authentication Zod Schemas
 * Validation schemas for auth-related operations
 **/

import { z } from "zod";
import {
  phoneSchema,
  emailSchema,
  passwordSchema,
  flexibleOtpCodeSchema,
} from "./common.schema";

export const registerSchema = z
  .object({
    phone: phoneSchema,
    password: passwordSchema,
    email: emailSchema.optional().nullable(),
    role: z.enum(["student", "teacher"]).optional().default("student"),
    student_id: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    department_id: z
      .string()
      .uuid("Invalid department format")
      .optional()
      .nullable(),
    batch_id: z.string().uuid("Invalid batch format").optional().nullable(),
    section_id: z.string().uuid("Invalid section format").optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    blood_group: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    designation: z.string().optional(),
    faculty_id: z.string().uuid("Invalid faculty format").optional(),
    description: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "student") {
      if (!data.student_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Student ID is required for students",
          path: ["student_id"],
        });
      }
    } else if (data.role === "teacher") {
      if (!data.designation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Designation is required for teachers",
          path: ["designation"],
        });
      }
      if (!data.faculty_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Faculty is required for teachers",
          path: ["faculty_id"],
        });
      }
    }
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
