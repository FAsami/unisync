export interface SendNotificationPayload {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface NotificationResult {
  success: boolean;
  sentCount: number;
  failedTokens?: string[];
  error?: string;
}
