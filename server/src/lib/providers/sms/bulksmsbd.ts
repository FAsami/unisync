import { SMSProvider } from "../../../types";
import { config } from "../../../config/environment";
import logger from "../../../config/logger";
import axios from "axios";

interface BulkSMSProviderConfig {
  provider: {
    identifier: string;
    website: string;
    endpoint: {
      url: string;
      method: string;
      query: Array<{
        key: string;
        value: any;
      }>;
      headers: Record<string, string>;
      variables?: {
        env?: string[];
        template?: string[];
      };
    };
  };
  template: Record<string, any>;
  providerToUse: string;
}

export const createBulkSMSBDProvider = (
  providerConfig: BulkSMSProviderConfig
): SMSProvider => {
  if (
    !config.BULK_SMS_API_KEY ||
    !config.BULK_SMS_SECRET_KEY ||
    !config.BULK_SMS_CALLER_ID
  ) {
    throw new Error(
      "BulkSMS credentials (BULK_SMS_API_KEY, BULK_SMS_SECRET_KEY, BULK_SMS_CALLER_ID) are required"
    );
  }

  const getSMSMessage = (
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET" | "DELETE_ACCOUNT"
  ): string => {
    const expiryMinutes = config.OTP_EXPIRY_MINUTES;

    switch (purpose) {
      case "LOGIN":
        return `${otp} is your OTP for unisync login. Valid for ${expiryMinutes} minutes. - unisync`;
      case "SIGNUP":
        return `${otp} is your OTP for unisync signup. Valid for ${expiryMinutes} minutes. - unisync`;
      case "PASSWORD_RESET":
        return `${otp} is your OTP for unisync password reset. Valid for ${expiryMinutes} minutes. - unisync`;
      case "DELETE_ACCOUNT":
        return `${otp} is your OTP for deleing your unisync account. Valid for ${expiryMinutes} minutes. - unisync`;
    }
  };

  const sendSMS = async (to: string, message: string): Promise<void> => {
    try {
      const endpoint = `http://118.67.213.114:3775/sendtext?apikey=${config.BULK_SMS_API_KEY}&secretkey=${config.BULK_SMS_SECRET_KEY}&callerID=${config.BULK_SMS_CALLER_ID}&toUser=${to}&messageContent=${message}`;
      const response = await axios.get(endpoint);
      logger.info(`Response from BulkSMSBD`, {
        to,
        response: response.data,
      });

      const result = response.data;

      if (result.Status !== "0") {
        throw new Error(
          `BulkSMSBD rejected SMS: ${result.StatusDescription || result.Text}`
        );
      }

      logger.info(`SMS sent successfully via BulkSMSBD`, {
        to,
        messageId: result.Message_ID,
        status: result.Text,
      });
    } catch (error) {
      logger.error(`Failed to send SMS via BulkSMSBD`, { error, to });
      throw new Error("Failed to send SMS");
    }
  };

  return {
    send: async (
      to: string,
      otp: string,
      purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
    ): Promise<void> => {
      const message = getSMSMessage(otp, purpose);
      await sendSMS(to, message);
    },
    sendSMS,
  };
};
