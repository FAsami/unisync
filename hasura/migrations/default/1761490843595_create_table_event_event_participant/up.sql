CREATE TABLE "event"."event_participant" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "event_id" uuid NOT NULL, "user_id" uuid NOT NULL, "event_room_id" uuid NOT NULL, "seat_number" text, "attendance_status" text NOT NULL DEFAULT 'pending', "notes" text, "requirements" text, "checked_in_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );COMMENT ON TABLE "event"."event_participant" IS E'Individual participant tracking (Can be used for exams and to track attendance for a particular event).';
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
CREATE TRIGGER "set_event_event_participant_updated_at"
BEFORE UPDATE ON "event"."event_participant"
FOR EACH ROW
EXECUTE PROCEDURE "event"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_event_event_participant_updated_at" ON "event"."event_participant"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
