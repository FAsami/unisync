CREATE TABLE "event"."event_room" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "event_id" uuid NOT NULL, "room_id" uuid NOT NULL, "capacity" integer, "is_primary_room" boolean DEFAULT false, "room_notes" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );COMMENT ON TABLE "event"."event_room" IS E'Room assignments for events (supports multi-room events).';
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
CREATE TRIGGER "set_event_event_room_updated_at"
BEFORE UPDATE ON "event"."event_room"
FOR EACH ROW
EXECUTE PROCEDURE "event"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_event_event_room_updated_at" ON "event"."event_room"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
