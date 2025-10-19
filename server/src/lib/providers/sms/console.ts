/**
 * Console SMS Provider for Development/Testing
 * Logs OTP to console instead of sending actual SMS
 */

import { SMSProvider } from "../interface";
import logger from "../../../config/logger";

export class ConsoleSMSProvider implements SMSProvider {
  async send(
    to: string,
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): Promise<void> {
    logger.info(`[Console SMS Provider] Sending OTP`, {
      to,
      otp,
      purpose,
    });

    console.log("\n========================================");
    console.log("📱 SMS OTP (Development Mode)");
    console.log("========================================");
    console.log(`To: ${to}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP Code: ${otp}`);
    console.log("========================================\n");
  }

  async sendSMS(to: string, message: string): Promise<void> {
    logger.info(`[Console SMS Provider] Sending SMS`, {
      to,
    });

    console.log("\n========================================");
    console.log("📱 SMS (Development Mode)");
    console.log("========================================");
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log("========================================\n");
  }
}
