/**
 * Notification Provider Interface
 * Allows support for multiple notification services (FCM, OneSignal, Pusher, etc.)
 */

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface NotificationResult {
  success: boolean;
  sentCount: number;
  failedCount?: number;
  failedTokens?: string[];
  error?: string;
  provider: string;
}

export interface NotificationProvider {
  name: string;
  sendToUsers(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<NotificationResult>;
  isAvailable(): boolean;
}
