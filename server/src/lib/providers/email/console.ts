/**
 * Console Email Provider for Development/Testing
 * Logs OTP to console instead of sending actual emails
 */

import { EmailProvider } from "../interface";
import logger from "../../../config/logger";

export class ConsoleEmailProvider implements EmailProvider {
  async send(
    to: string,
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): Promise<void> {
    logger.info(`[Console Email Provider] Sending OTP`, {
      to,
      otp,
      purpose,
    });

    console.log("\n========================================");
    console.log("📧 EMAIL OTP (Development Mode)");
    console.log("========================================");
    console.log(`To: ${to}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP Code: ${otp}`);
    console.log("========================================\n");
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    logger.info(`[Console Email Provider] Sending email`, {
      to,
      subject,
    });

    console.log("\n========================================");
    console.log("📧 EMAIL (Development Mode)");
    console.log("========================================");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("========================================\n");
  }
}
