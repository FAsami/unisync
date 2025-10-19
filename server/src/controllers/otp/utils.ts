import bcrypt from "bcrypt";
import crypto from "crypto";
import { config } from "../../config/environment";

/**
 * Generate a random numeric OTP based on configured length
 * Uses crypto.randomInt for cryptographically secure random numbers (OWASP recommendation)
 */
export const generateOTP = (): string => {
  const length = config.OTP_LENGTH;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  // Use crypto.randomInt for secure random number generation
  const otp = crypto.randomInt(min, max + 1);
  return otp.toString().padStart(length, "0");
};

/**
 * Hash OTP using bcrypt with configured salt rounds
 * OWASP recommends bcrypt with at least 10 rounds (we use 12 by default)
 */
export const hashOTP = async (otp: string): Promise<string> => {
  const saltRounds = config.OTP_BCRYPT_ROUNDS;
  return await bcrypt.hash(otp, saltRounds);
};

/**
 * Verify OTP against stored hash
 * Uses constant-time comparison to prevent timing attacks (OWASP recommendation)
 */
export const verifyOTP = async (
  plainOTP: string,
  hashedOTP: string
): Promise<boolean> => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

/**
 * Calculate OTP expiry timestamp based on configured minutes
 */
export const getOTPExpiry = (): Date => {
  const expiryMinutes = config.OTP_EXPIRY_MINUTES;
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

/**
 * Check if OTP has expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};
