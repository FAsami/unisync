/**
 * SMS Provider Factory
 * Returns the appropriate SMS provider based on configuration
 */

import { SMSProvider } from "../interface";
import { ConsoleSMSProvider } from "./console";
import { TwilioSMSProvider } from "./twilio";
import { config } from "../../../config/environment";
import logger from "../../../config/logger";

export const getSMSProvider = (): SMSProvider => {
  const provider = config.SMS_PROVIDER;

  logger.info(`Initializing SMS provider: ${provider}`);

  switch (provider) {
    case "twilio":
      return new TwilioSMSProvider();
    case "console":
    default:
      return new ConsoleSMSProvider();
  }
};

export { ConsoleSMSProvider, TwilioSMSProvider };
