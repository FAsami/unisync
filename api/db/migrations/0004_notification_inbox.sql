-- Notification inbox (UX review decision 4): per-person read state.
-- (Delivery stays with the legacy Hasura trigger on notification.log until cut-over.)

CREATE TABLE notification.read (
    user_id uuid NOT NULL REFERENCES "user".account (id) ON DELETE CASCADE,
    notification_id uuid NOT NULL REFERENCES notification.log (id) ON DELETE CASCADE,
    read_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, notification_id)
);

COMMENT ON TABLE notification.read IS 'Which person has read which notification (inbox read state).';

CREATE INDEX notification_read_by_notification ON notification.read (notification_id);

-- Inbox lookups: notifications for an audience, newest first.
CREATE INDEX notification_log_audience ON notification.log (target_type, target_id, created_at DESC);
CREATE INDEX notification_log_sender ON notification.log (created_by, created_at DESC);

-- A push token belongs to one person at a time (handled by the API), and
-- lookups by token must be fast.
CREATE INDEX device_token ON "user".device (token);
