/**
 * Twilio SMS Provider
 * Uses Twilio API to send SMS messages
 */

import { SMSProvider } from "../interface";
import { config } from "../../../config/environment";
import logger from "../../../config/logger";

export class TwilioSMSProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN) {
      throw new Error(
        "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required for Twilio SMS provider"
      );
    }
    if (!config.TWILIO_FROM_NUMBER) {
      throw new Error("TWILIO_FROM_NUMBER is required for Twilio SMS provider");
    }

    this.accountSid = config.TWILIO_ACCOUNT_SID;
    this.authToken = config.TWILIO_AUTH_TOKEN;
    this.fromNumber = config.TWILIO_FROM_NUMBER;
  }

  async send(
    to: string,
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): Promise<void> {
    const message = this.getSMSMessage(otp, purpose);
    await this.sendSMS(to, message);
  }

  async sendSMS(to: string, message: string): Promise<void> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

      const credentials = Buffer.from(
        `${this.accountSid}:${this.authToken}`
      ).toString("base64");

      const body = new URLSearchParams({
        To: to,
        From: this.fromNumber,
        Body: message,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Twilio API error: ${error}`);
      }

      logger.info(`SMS sent successfully via Twilio`, { to });
    } catch (error) {
      logger.error(`Failed to send SMS via Twilio`, { error, to });
      throw new Error("Failed to send SMS");
    }
  }

  private getSMSMessage(
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): string {
    const expiryMinutes = config.OTP_EXPIRY_MINUTES;

    switch (purpose) {
      case "LOGIN":
        return `Your login verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
      case "SIGNUP":
        return `Your signup verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
      case "PASSWORD_RESET":
        return `Your password reset code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
    }
  }
}
