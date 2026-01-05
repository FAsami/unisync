import { providerRegistry } from "./providers";
import {
  NotificationPayload,
  NotificationResult,
} from "../types/notificationProvider";
import logger from "../config/logger";

/**
 * Send notification to users using all available providers
 * This allows sending via FCM + OneSignal simultaneously for redundancy
 */
export async function sendNotificationViaProviders(
  userIds: string[],
  payload: NotificationPayload
): Promise<NotificationResult[]> {
  const providers = providerRegistry.getProviders();

  if (providers.length === 0) {
    logger.error("No notification providers available");
    return [
      {
        success: false,
        sentCount: 0,
        provider: "none",
        error: "No providers configured",
      },
    ];
  }

  logger.info(
    `Sending notification via ${providers.length} provider(s): ${providers
      .map((p) => p.name)
      .join(", ")}`
  );

  // Send via all providers in parallel
  const results = await Promise.all(
    providers.map((provider) => provider.sendToUsers(userIds, payload))
  );

  return results;
}

/**
 * Send notification via primary provider only
 * Useful when you don't need redundancy
 */
export async function sendNotificationViaPrimaryProvider(
  userIds: string[],
  payload: NotificationPayload
): Promise<NotificationResult> {
  const provider = providerRegistry.getPrimaryProvider();

  if (!provider) {
    logger.error("No primary notification provider available");
    return {
      success: false,
      sentCount: 0,
      provider: "none",
      error: "No providers configured",
    };
  }

  logger.info(`Sending notification via ${provider.name}`);
  return provider.sendToUsers(userIds, payload);
}
