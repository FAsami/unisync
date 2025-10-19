import { SMSProvider } from "../interface";
import { createBulkSMSBDProvider } from "./bulksmsbd";
import logger from "../../../config/logger";
import { gqlClient } from "../../graphqlClient";
import { GET_SETTING } from "../../../controllers/otp/gql";

export const getSMSProvider = async (): Promise<SMSProvider> => {
  const result = await gqlClient.query<{
    settings_config: Array<{
      identifier: string;
      scope: string;
      value: {
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
            variables: {
              env: string[];
              template: string[];
            };
          };
        };
        template: Record<string, any>;
        providerToUse: string;
      };
    }>;
  }>(GET_SETTING, {
    where: {
      identifier: { _eq: "OTP_PROVIDER" },
    },
  });

  if (!result.settings_config || result.settings_config.length === 0) {
    throw new Error("SMS provider configuration not found in settings");
  }

  const providerConfig = result.settings_config[0].value;
  const provider = providerConfig.providerToUse;

  logger.info(`Initializing SMS provider: ${provider}`);
  if (provider === "bulksmsbd") {
    return createBulkSMSBDProvider(providerConfig);
  } else {
    throw new Error(`SMS provider "${provider}" is not supported`);
  }
};

export { createBulkSMSBDProvider };
