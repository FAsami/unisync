import { messaging, isFirebaseInitialized } from "@/lib/firebase";
import { gqlClient } from "@/lib/graphqlClient";
import {
  SendNotificationPayload,
  NotificationResult,
} from "@/types/notification";
import logger from "@/config/logger";

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

export async function sendNotificationToUsers(
  payload: SendNotificationPayload,
  provider: string = "fcm"
): Promise<NotificationResult> {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      logger.warn("Firebase not initialized, cannot send notifications");
      return {
        success: false,
        sentCount: 0,
        error:
          "Firebase Admin SDK not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_PATH.",
      };
    }

    const userIds = payload.userId ? [payload.userId] : payload.userIds || [];

    if (userIds.length === 0) {
      return {
        success: false,
        sentCount: 0,
        error: "No user IDs provided",
      };
    }

    // Fetch active tokens for users from specified provider
    const { user_device } = await gqlClient.query<{
      user_device: Array<{
        id: string;
        provider: string;
        token: string;
        user_id: string;
      }>;
    }>(GET_USER_TOKENS, {
      user_ids: userIds,
      provider,
    });

    if (user_device.length === 0) {
      return {
        success: false,
        sentCount: 0,
        error: `No active ${provider} tokens found for users`,
      };
    }

    const tokens = user_device.map((d) => d.token);

    // Prepare FCM message
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: payload.data || {},
      tokens,
    };

    // Send multicast message
    const response = await messaging.sendEachForMulticast(message);

    logger.info(`Sent ${response.successCount} notifications successfully`);

    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          logger.error(`Failed to send to token: ${tokens[idx]}`, resp.error);
        }
      });

      // TODO: Mark failed tokens as inactive in database

      return {
        success: response.successCount > 0,
        sentCount: response.successCount,
        failedTokens,
      };
    }

    return {
      success: true,
      sentCount: response.successCount,
    };
  } catch (error) {
    logger.error("Error sending notification:", error);
    return {
      success: false,
      sentCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
