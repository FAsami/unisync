# Notification system

A notice is a row in `notification.log`. People read it in their inbox, and it
is also pushed to their phones. Writing a notice and delivering it are separate
steps: writers only insert the row, and `PushDispatcher` delivers it.

```
class change ──┐
               ├──▶ INSERT notification.log (status 'pending')
POST /notifications ┘            │
                                 ├──▶ inbox: GET /me/notifications (AudienceService decides who sees it)
                                 └──▶ PushDispatcher ──▶ FCM ──▶ phones
```

## Audiences

A notice targets one audience: `department`, `batch`, `section` or `user`.
`AudienceService` is the single definition of audiences. It answers two questions:

- **Who receives it:** for the inbox, the counts and push recipients.
- **Who may address it:**

  | Sender | May address |
  | --- | --- |
  | Department admin | their department, its batches, its sections |
  | Teacher | the sections they teach |
  | CR | their own section |

Nobody sends university-wide. `GET /notifications/audiences` lists what the
signed-in person may address.

## Where notices come from

- **Sending:** `POST /notifications` with a title, a body and an audience. It is rate-limited per person.
- **Class changes:** cancel, move, change room and undo each insert a notice to
  the section, in the same transaction as the change.

Every notice carries its own id as `data.notificationId`, so tapping a push
opens that notice. All `data` values are strings, as FCM requires.

## Inbox

- `GET /me/notifications` returns your notices newest first, with an unread
  count. Page through older ones with `before`.
- `POST /me/notifications/{id}/read` and `POST /me/notifications/read-all` mark notices read.
- Read state is stored in `notification.read`, one row per person per notice.
- Senders see their own notices with push and read counts in `GET /notifications/sent`.

## Push delivery (`PushDispatcher`)

A background service in the API:

1. **Claims** pending rows with `FOR UPDATE SKIP LOCKED`, so several API machines
   never send the same row twice. A row stuck in `processing` (its machine died
   mid-send) is claimed again after a timeout.
2. **Resolves** the recipients' active devices through `AudienceService`.
3. **Sends** through `IPushSender`. In production that is `FcmPushSender`, using
   FCM HTTP v1 with a Firebase service-account key.
4. **Records** the outcome on the row: `status` (`pending → processing → sent | failed`),
   `sent_count`, `failed_count`, `error_message` and `processed_at`.
5. **Turns off** devices whose token FCM reports as dead (unregistered or invalid).

Rows older than `Push:MaxAge` (one hour by default) are marked failed instead of
pushed, so turning delivery on never sends a backlog. Those notices are still
in the inbox.

| Setting | Default | Notes |
| --- | --- | --- |
| `Push:Enabled` | `false` | Outside Development, turning it on requires a valid key at startup |
| `Push:FcmServiceAccountJson` | — | Raw JSON or base64 |
| `Push:PollInterval` | 3 s | |
| `Push:BatchSize` | 20 | |
| `Push:MaxParallelSends` | 8 | |
| `Push:RetryProcessingAfter` | 10 min | |
| `Push:MaxAge` | 1 h | |

While `Push:Enabled` is false, notices still reach inboxes. The sent list shows
them as waiting for push.

## Devices

The app registers its push token with `PUT /me/devices`, under a stable install
id. A token belongs to one person: registering it removes it from anyone else.
Signing out with the install id turns that device off. Deleting an account,
deactivating someone or changing their number turns off all their devices.
