/**
 * Email Provider Factory
 * Returns the appropriate email provider based on configuration
 */

import { EmailProvider } from "../interface";
import { ConsoleEmailProvider } from "./console";
import { ResendEmailProvider } from "./resend";
import { SendGridEmailProvider } from "./sendgrid";
import { config } from "../../../config/environment";
import logger from "../../../config/logger";

export const getEmailProvider = (): EmailProvider => {
  const provider = config.EMAIL_PROVIDER;

  logger.info(`Initializing email provider: ${provider}`);

  switch (provider) {
    case "resend":
      return new ResendEmailProvider();
    case "sendgrid":
      return new SendGridEmailProvider();
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
};

export { ConsoleEmailProvider, ResendEmailProvider, SendGridEmailProvider };
