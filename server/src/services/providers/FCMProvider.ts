import { messaging, isFirebaseInitialized } from "../../lib/firebase";
import { gqlClient } from "../../lib/graphqlClient";
import {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
} from "../../types/notificationProvider";
import logger from "../../config/logger";

const GET_USER_TOKENS = `
  query GetUserTokens($user_ids: [uuid!]!, $provider: String!) {
    user_device(
      where: {
        user_id: { _in: $user_ids }
        is_active: { _eq: true }
        provider: { _eq: $provider }
      }
    ) {
      id
      provider
      token
      user_id
    }
  }
`;

export class FCMProvider implements NotificationProvider {
  name = "FCM";

  isAvailable(): boolean {
    return isFirebaseInitialized();
  }

  async sendToUsers(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          sentCount: 0,
          provider: this.name,
          error: "FCM not initialized",
        };
      }

      if (userIds.length === 0) {
        return {
          success: false,
          sentCount: 0,
          provider: this.name,
          error: "No user IDs provided",
        };
      }

      // Fetch FCM tokens
      const { user_device } = await gqlClient.query<{
        user_device: Array<{
          id: string;
          provider: string;
          token: string;
          user_id: string;
        }>;
      }>(GET_USER_TOKENS, {
        user_ids: userIds,
        provider: "fcm",
      });

      if (user_device.length === 0) {
        return {
          success: false,
          sentCount: 0,
          provider: this.name,
          error: "No FCM tokens found for users",
        };
      }

      const tokens = user_device.map((d) => d.token);

      // Send via FCM
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
        },
        data: payload.data || {},
        tokens,
      };

      const response = await messaging.sendEachForMulticast(message);

      logger.info(
        `[FCM] Sent ${response.successCount}/${tokens.length} notifications`
      );

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            logger.warn(`[FCM] Failed token: ${tokens[idx]}`, resp.error);
          }
        });

        return {
          success: response.successCount > 0,
          sentCount: response.successCount,
          failedCount: response.failureCount,
          failedTokens,
          provider: this.name,
        };
      }

      return {
        success: true,
        sentCount: response.successCount,
        failedCount: 0,
        provider: this.name,
      };
    } catch (error) {
      logger.error("[FCM] Error sending notification:", error);
      return {
        success: false,
        sentCount: 0,
        provider: this.name,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
