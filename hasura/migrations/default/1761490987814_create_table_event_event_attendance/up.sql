CREATE TABLE "event"."event_attendance" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "event_id" uuid NOT NULL, "user_id" uuid NOT NULL, "marked_at" timestamptz NOT NULL, "status" text NOT NULL DEFAULT 'pending', "marked_by" uuid NOT NULL, "notes" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );COMMENT ON TABLE "event"."event_attendance" IS E'Attendance tracking for regular lectures (without participant records).';
CREATE OR REPLACE FUNCTION "event"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_event_event_attendance_updated_at"
BEFORE UPDATE ON "event"."event_attendance"
FOR EACH ROW
EXECUTE PROCEDURE "event"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_event_event_attendance_updated_at" ON "event"."event_attendance"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
