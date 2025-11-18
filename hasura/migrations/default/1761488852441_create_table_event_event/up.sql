CREATE TABLE "event"."event" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "event_type" text NOT NULL, "title" text NOT NULL, "description" text, "course_offering_id" uuid, "date" date NOT NULL, "start_time" timetz NOT NULL, "end_time" timetz NOT NULL, "status" text NOT NULL DEFAULT 'scheduled', "priority" text DEFAULT 'normal', "routine_id" uuid, "metadata" jsonb, "created_by" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("course_offering_id") REFERENCES "academic"."course_offering"("id") ON UPDATE restrict ON DELETE set null, FOREIGN KEY ("routine_id") REFERENCES "event"."routine"("id") ON DELETE set null, FOREIGN KEY ("created_by") REFERENCES "user"."account"("id"));
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
CREATE TRIGGER "set_event_event_updated_at"
BEFORE UPDATE ON "event"."event"
FOR EACH ROW
EXECUTE PROCEDURE "event"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_event_event_updated_at" ON "event"."event"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
