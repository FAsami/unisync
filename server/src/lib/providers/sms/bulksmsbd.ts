import { SMSProvider } from "../interface";
import { config } from "../../../config/environment";
import logger from "../../../config/logger";
import axios from "axios";

interface ProviderConfig {
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
  providerConfig: ProviderConfig
): SMSProvider => {
  const requiredEnvVars = providerConfig.provider.endpoint.variables?.env || [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} is required for BulkSMSBD provider`);
    }
  }

  const getSMSMessage = (
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): string => {
    const expiryMinutes = config.OTP_EXPIRY_MINUTES;

    switch (purpose) {
      case "LOGIN":
        return `Your UniSync login verification code is ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;
      case "SIGNUP":
        return `Your UniSync signup verification code is ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;
      case "PASSWORD_RESET":
        return `Your UniSync password reset code is ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;
    }
  };

  const sendSMS = async (to: string, message: string): Promise<void> => {
    try {
      console.log("Sending SMS via BulkSMSBD", {
        to,
        message,
      });
      const endpoint = `http://118.67.213.114:3775/sendtext?apikey=${process.env.BULK_SMS_API_KEY}&secretkey=${process.env.BULK_SMS_SECRET_KEY}&callerID=${process.env.BULK_SMS_CALLER_ID}&toUser=${to}&messageContent=${message}`;
      console.log("Endpoint", endpoint);
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
