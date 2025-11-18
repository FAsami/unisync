CREATE TABLE "event"."event_instructor" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "event_room_id" uuid NOT NULL, "instructor_id" uuid NOT NULL, "role" text NOT NULL, "is_primary" boolean DEFAULT false, "responsibility_notes" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );COMMENT ON TABLE "event"."event_instructor" IS E'Instructor assignments per room (supports multi-instructor).';
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
CREATE TRIGGER "set_event_event_instructor_updated_at"
BEFORE UPDATE ON "event"."event_instructor"
FOR EACH ROW
EXECUTE PROCEDURE "event"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_event_event_instructor_updated_at" ON "event"."event_instructor"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
