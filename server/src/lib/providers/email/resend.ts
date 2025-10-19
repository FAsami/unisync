/**
 * Resend Email Provider
 * Uses Resend API to send emails
 */

import { EmailProvider } from "../interface";
import { config } from "../../../config/environment";
import logger from "../../../config/logger";

export class ResendEmailProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    if (!config.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required for Resend email provider");
    }
    this.apiKey = config.RESEND_API_KEY;
    this.fromEmail = config.SENDGRID_FROM_EMAIL || "noreply@yourdomain.com";
  }

  async send(
    to: string,
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): Promise<void> {
    const subject = this.getSubject(purpose);
    const body = this.getEmailBody(otp, purpose);

    await this.sendEmail(to, subject, body);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html: body,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }

      logger.info(`Email sent successfully via Resend`, { to, subject });
    } catch (error) {
      logger.error(`Failed to send email via Resend`, { error, to });
      throw new Error("Failed to send email");
    }
  }

  private getSubject(purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"): string {
    switch (purpose) {
      case "LOGIN":
        return "Your Login Verification Code";
      case "SIGNUP":
        return "Verify Your Account";
      case "PASSWORD_RESET":
        return "Reset Your Password";
    }
  }

  private getEmailBody(
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): string {
    const expiryMinutes = config.OTP_EXPIRY_MINUTES;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Your Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verification Code</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hello,</p>
            <p>Your verification code for ${purpose
              .toLowerCase()
              .replace("_", " ")} is:</p>
            
            <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea;">
              <h2 style="font-size: 32px; letter-spacing: 8px; margin: 0; color: #667eea;">${otp}</h2>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This code will expire in <strong>${expiryMinutes} minutes</strong>.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              If you didn't request this code, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message, please do not reply.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}
