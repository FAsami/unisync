# Notification System

## Overview

Multi-channel notification system for event changes, reminders, and announcements. Supports SMS and Push notifications with priority-based delivery and user preferences.

## Key Features

### Channels
- **SMS** - Sent via BulkSMSBD provider
- **Push** - Firebase Cloud Messaging (FCM)

### Notification Types
- `schedule_reminder` - Daily/weekly schedule reminders
- `schedule_change` - Room/time changes
- `cancellation` - Event cancellations
- `exam_alert` - Exam notifications
- `seminar_announcement` - Seminar announcements
- `general` - General notifications

### Priority Levels
- **Urgent** (exams, cancellations):
  - SMS + Push immediately
  - High visibility
  
- **Normal** (lectures, room changes):
  - Push preferred, SMS fallback
  - Standard delivery
  
- **Low** (seminars, announcements):
  - Push only
  - Batched delivery

## Database Schema

### notification.notification
Main notification records.

### notification.notification_recipient
Individual delivery tracking per user per channel.

### notification.device_token
FCM/APNS tokens for push notifications.

### notification.notification_template
Reusable templates for common notifications.

### notification.user_preference
User opt-in/opt-out preferences.

See [Database Schema](/architecture/database-schema) for complete table definitions.

## Automatic Triggers

### Event Change Notification
**Trigger:** INSERT on `event.event_change`

**Webhook:** `/webhooks/event-change-notification`

**Logic:**
1. Detect change type (room, time, etc.)
2. Resolve recipients from `event_target`
3. Determine priority based on event.priority and change_type
4. Create notification record
5. Create recipient records for all students
6. Send via configured channels
7. Update `notification_sent = true`

**Example:**
```sql
-- Room change triggers notification
INSERT INTO event.event_change (
  event_id, change_type, old_value, new_value, reason
) VALUES (...);

-- Trigger automatically creates notification
```

### Cancellation Notification
**Trigger:** INSERT on `event.event_cancellation`

**Webhook:** `/webhooks/event-cancellation-notification`

**Logic:**
1. Get cancellation details
2. Resolve recipients from `event_target`
3. Create urgent notification (SMS + Push)
4. Include rescheduled event info if available
5. Send to all recipients
6. Update `notification_sent = true`

## Manual Notifications

### Send Schedule Reminder
```graphql
mutation SendReminder {
  sendNotification(input: {
    title: "Tomorrow's Schedule"
    message: "You have 3 classes tomorrow"
    notification_type: schedule_reminder
    priority: normal
    target_type: batch
    target_id: "batch-uuid"
    channels: ["push"]
  }) {
    id
    status
  }
}
```

## Device Token Management

### Register Device (Mobile App)
```graphql
mutation RegisterDevice {
  registerDeviceToken(input: {
    token: "fcm-token-xyz123"
    platform: android
    device_info: {model: "Samsung S21", os: "Android 12"}
  }) {
    success
  }
}
```

**Backend:** Creates or updates `notification.device_token` record.

### Unregister Device
```graphql
mutation UnregisterDevice {
  unregisterDeviceToken(token: "fcm-token-xyz123") {
    success
  }
}
```

## Delivery Flow

1. **Notification Created**
   - Via trigger or manual
   - Targets defined (batch/section/course)

2. **Recipients Resolved**
   - Fetch users from target
   - Check user preferences
   - Filter by enabled channels

3. **Recipient Records Created**
   - One per user
   - Status: pending

4. **Channels Executed**
   - SMS: Send via BulkSMSBD
   - Push: Send via FCM
   - Update recipient status

5. **Delivery Tracking**
   - SMS: sent → delivered
   - Push: sent → delivered
   - Track read status

## User Preferences

### Update Preferences
```graphql
mutation UpdatePreferences {
  updateNotificationPreferences(
    preferences: [
      {event_type: lecture, notification_type: change, channel: sms, enabled: false},
      {event_type: exam, notification_type: alert, channel: sms, enabled: true}
    ]
  ) {
    success
  }
}
```

**Effect:** User receives only enabled notifications via enabled channels.

## Notification Templates

### Predefined Templates
1. **Room Change**
   - Title: "Room Change: {{event_title}}"
   - Message: "Your event has been moved from {{old_room}} to {{new_room}}"

2. **Cancellation**
   - Title: "Event Cancelled: {{event_title}}"
   - Message: "{{reason}}. Rescheduled to {{new_date}} at {{new_time}}"

3. **Exam Alert**
   - Title: "Upcoming Exam: {{exam_title}}"
   - Message: "Room {{room}}, Seat {{seat}}. Starts at {{time}}"

### Use Template
```graphql
mutation SendFromTemplate {
  sendNotificationFromTemplate(
    template_name: "exam_room_change"
    variables: {
      event_title: "CSE 301 Midterm"
      old_room: "Room 201"
      new_room: "Room 305"
      date: "2025-02-15"
      time: "14:00"
    }
    target_type: course_offering
    target_id: "course-uuid"
  ) {
    id
  }
}
```

## Query Patterns

### Get User Notifications
```graphql
query GetMyNotifications($user_id: uuid!, $limit: Int, $offset: Int) {
  notification_recipient(
    where: {user_id: {_eq: $user_id}}
    order_by: {created_at: desc}
    limit: $limit
    offset: $offset
  ) {
    notification {
      title
      message
      notification_type
      priority
      created_at
    }
    read_at
    push_status
    sms_status
  }
}
```

### Unread Count
```graphql
query GetUnreadCount($user_id: uuid!) {
  notification_recipient_aggregate(
    where: {user_id: {_eq: $user_id}, read_at: {_is_null: true}}
  ) {
    aggregate { count }
  }
}
```

### Mark as Read
```graphql
mutation MarkAsRead($notification_recipient_id: uuid!) {
  update_notification_recipient_by_pk(
    pk_columns: {id: $notification_recipient_id}
    _set: {read_at: "now()"}
  ) {
    id
  }
}
```

## Configuration

### Environment Variables
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

BULK_SMS_API_KEY=your-api-key
BULK_SMS_SECRET_KEY=your-secret-key
BULK_SMS_CALLER_ID=your-sender-id
```

### Settings
```sql
-- Configure default channels per priority
INSERT INTO settings.config (identifier, value) VALUES (
  'notification_channels',
  '{
    "urgent": ["sms", "push"],
    "normal": ["push"],
    "low": ["push"]
  }'::jsonb
);
```

## Testing

### Test Notification
```graphql
mutation TestNotification {
  sendTestNotification(
    user_id: "test-user-uuid"
    channel: push
  ) {
    success
  }
}
```

## Best Practices

1. **Use appropriate priority** - Urgent for time-sensitive, normal for updates
2. **Respect user preferences** - Check before sending
3. **Batch low-priority** - Group multiple notifications
4. **Log all deliveries** - Track in recipient records
5. **Handle failures gracefully** - Retry logic for SMS
6. **Monitor delivery rates** - Track SMS/push success
7. **Clean old tokens** - Remove inactive device tokens
8. **Test templates** - Verify variable substitution

## Integration with Event System

Event changes automatically trigger notifications via Hasura event triggers. See [Event Management System](/architecture/event-system) for details.

