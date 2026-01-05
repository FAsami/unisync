import { Request, Response } from "express";
import { gqlClient } from "../../lib/graphqlClient";
import { sendNotificationViaPrimaryProvider } from "../../services/notificationService";
import logger from "../../config/logger";

interface HasuraEventPayload {
  event: {
    op: "INSERT" | "UPDATE" | "DELETE";
    data: {
      old: any;
      new: any;
    };
  };
  table: {
    name: string;
    schema: string;
  };
}

const GET_TARGET_USERS = `
  query GetTargetUsers($targetType: String!, $targetId: uuid) {
    users: user_account(
      where: {
        _and: [
          { is_active: { _eq: true } }
        ]
      }
    ) {
      id
    }
  }
`;

const GET_SECTION_USERS = `
  query GetSectionUsers($sectionId: uuid!) {
    users: user_account(
      where: {
        is_active: { _eq: true }
        profiles: { section_id: { _eq: $sectionId } }
      }
    ) {
      id
    }
  }
`;

const GET_BATCH_USERS = `
  query GetBatchUsers($batchId: uuid!) {
    users: user_account(
      where: {
        is_active: { _eq: true }
        profiles: { batch_id: { _eq: $batchId } }
      }
    ) {
      id
    }
  }
`;

const GET_DEPARTMENT_USERS = `
  query GetDepartmentUsers($departmentId: uuid!) {
    users: user_account(
      where: {
        is_active: { _eq: true }
        profiles: { department_id: { _eq: $departmentId } }
      }
    ) {
      id
    }
  }
`;

const UPDATE_NOTIFICATION_STATUS = `
  mutation UpdateNotificationStatus(
    $id: uuid!
    $status: String!
    $sentCount: Int
    $failedCount: Int
    $errorMessage: String
  ) {
    update_notification_log_by_pk(
      pk_columns: { id: $id }
      _set: {
        status: $status
        sent_count: $sentCount
        failed_count: $failedCount
        error_message: $errorMessage
        processed_at: "now()"
      }
    ) {
      id
    }
  }
`;

export async function handleSendNotificationEvent(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const payload = req.body as HasuraEventPayload;
    const notification = payload.event.data.new;

    logger.info("Processing send-notification event", {
      id: notification.id,
      target_type: notification.target_type,
    });

    // Update status to processing (only set status, don't pass null for counts)
    await gqlClient.mutation(
      `mutation UpdateStatus($id: uuid!, $status: String!) {
        update_notification_log_by_pk(
          pk_columns: { id: $id }
          _set: { status: $status, processed_at: "now()" }
        ) { id }
      }`,
      {
        id: notification.id,
        status: "processing",
      }
    );

    // Resolve target users based on target_type
    let userIds: string[] = [];

    try {
      switch (notification.target_type) {
        case "all": {
          const { users } = await gqlClient.query<{
            users: Array<{ id: string }>;
          }>(GET_TARGET_USERS, {});
          userIds = users.map((u) => u.id);
          break;
        }

        case "section": {
          const { users } = await gqlClient.query<{
            users: Array<{ id: string }>;
          }>(GET_SECTION_USERS, {
            sectionId: notification.target_id,
          });
          userIds = users.map((u) => u.id);
          break;
        }

        case "batch": {
          const { users } = await gqlClient.query<{
            users: Array<{ id: string }>;
          }>(GET_BATCH_USERS, {
            batchId: notification.target_id,
          });
          userIds = users.map((u) => u.id);
          break;
        }

        case "department": {
          const { users } = await gqlClient.query<{
            users: Array<{ id: string }>;
          }>(GET_DEPARTMENT_USERS, {
            departmentId: notification.target_id,
          });
          userIds = users.map((u) => u.id);
          break;
        }

        case "user": {
          if (notification.target_id) {
            userIds = [notification.target_id];
          }
          break;
        }

        default:
          throw new Error(`Unknown target_type: ${notification.target_type}`);
      }
    } catch (queryError) {
      logger.error("Error querying target users:", queryError);
      await gqlClient.mutation(
        `mutation UpdateStatusFailed($id: uuid!, $status: String!, $errorMessage: String!) {
          update_notification_log_by_pk(
            pk_columns: { id: $id }
            _set: { 
              status: $status
              sent_count: 0
              error_message: $errorMessage
              processed_at: "now()" 
            }
          ) { id }
        }`,
        {
          id: notification.id,
          status: "failed",
          errorMessage: "Failed to resolve target users",
        }
      );
      return res.status(200).json({ success: true });
    }

    if (userIds.length === 0) {
      logger.warn("No users found for target", {
        target_type: notification.target_type,
        target_id: notification.target_id,
      });
      await gqlClient.mutation(
        `mutation UpdateStatusNoUsers($id: uuid!, $status: String!, $errorMessage: String!) {
          update_notification_log_by_pk(
            pk_columns: { id: $id }
            _set: { 
              status: $status
              sent_count: 0
              error_message: $errorMessage
              processed_at: "now()" 
            }
          ) { id }
        }`,
        {
          id: notification.id,
          status: "failed",
          errorMessage: "No users found for target",
        }
      );
      return res.status(200).json({ success: true });
    }

    logger.info(`Sending notification to ${userIds.length} users`);

    // Send notification via primary provider
    const result = await sendNotificationViaPrimaryProvider(userIds, {
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      imageUrl: notification.image_url,
    });

    // Update final status with counts
    await gqlClient.mutation(
      `mutation UpdateStatusComplete($id: uuid!, $status: String!, $sentCount: Int!, $failedCount: Int!, $errorMessage: String) {
        update_notification_log_by_pk(
          pk_columns: { id: $id }
          _set: {
            status: $status
            sent_count: $sentCount
            failed_count: $failedCount
            error_message: $errorMessage
            processed_at: "now()"
          }
        ) { id }
      }`,
      {
        id: notification.id,
        status: result.success ? "sent" : "failed",
        sentCount: result.sentCount || 0,
        failedCount: result.failedCount || 0,
        errorMessage: result.error || null,
      }
    );

    logger.info("Notification processed successfully", {
      id: notification.id,
      provider: result.provider,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Error in send-notification webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
