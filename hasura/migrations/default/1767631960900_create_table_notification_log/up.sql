CREATE TABLE "notification"."log" ("id" uuid NOT NULL, "title" text NOT NULL, "body" text NOT NULL, "target_type" text, "target_id" uuid NOT NULL, "data" jsonb, "image_url" text, "created_by" uuid NOT NULL, "status" text NOT NULL DEFAULT 'pending', "sent_count" integer NOT NULL DEFAULT 0, "failed_count" integer NOT NULL DEFAULT 0, "error_message" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "processed_at" timestamptz, PRIMARY KEY ("id") , FOREIGN KEY ("created_by") REFERENCES "user"."account"("id") ON UPDATE cascade ON DELETE restrict);
CREATE OR REPLACE FUNCTION "notification"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_notification_log_updated_at"
BEFORE UPDATE ON "notification"."log"
FOR EACH ROW
EXECUTE PROCEDURE "notification"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_notification_log_updated_at" ON "notification"."log"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
