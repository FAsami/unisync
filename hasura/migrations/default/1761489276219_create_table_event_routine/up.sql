CREATE TABLE "event"."routine" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text NOT NULL, "course_offering_id" uuid, "day_of_week" integer NOT NULL, "start_time" timetz NOT NULL, "end_time" timetz NOT NULL, "event_type" text NOT NULL DEFAULT 'lecture', "effective_from" date NOT NULL, "effective_to" date NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "metadata" jsonb, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("course_offering_id") REFERENCES "academic"."course_offering"("id") ON UPDATE restrict ON DELETE set null);
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
CREATE TRIGGER "set_event_routine_updated_at"
BEFORE UPDATE ON "event"."routine"
FOR EACH ROW
EXECUTE PROCEDURE "event"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_event_routine_updated_at" ON "event"."routine"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "event"."event" add constraint "event_routine_id_fkey" foreign key ("routine_id") references "event"."routine"("id") on delete set null;
