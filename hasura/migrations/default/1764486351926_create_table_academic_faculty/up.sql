CREATE TABLE "academic"."faculty" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text NOT NULL, "description" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );
CREATE OR REPLACE FUNCTION "academic"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_academic_faculty_updated_at"
BEFORE UPDATE ON "academic"."faculty"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_faculty_updated_at" ON "academic"."faculty"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
