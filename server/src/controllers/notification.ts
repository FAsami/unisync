import { Request, Response } from "express";
import { z } from "zod";
import { sendNotificationToUsers } from "@/utils/notification";
import logger from "@/config/logger";

const sendNotificationSchema = z
  .object({
    userId: z.string().uuid().optional(),
    userIds: z.array(z.string().uuid()).optional(),
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
    data: z.record(z.string(), z.string()).optional(),
    imageUrl: z.string().url().optional(),
    provider: z.string().optional().default("fcm"),
  })
  .refine((data) => data.userId || (data.userIds && data.userIds.length > 0), {
    message: "Either userId or userIds must be provided",
  });

export async function sendNotification(req: Request, res: Response) {
  try {
    const payload = sendNotificationSchema.parse(req.body);
    const { provider, ...notificationPayload } = payload;

    const result = await sendNotificationToUsers(notificationPayload, provider);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      sentCount: result.sentCount,
      ...(result.failedTokens && { failedTokens: result.failedTokens }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.issues,
      });
    }

    logger.error("Error in sendNotification controller:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
