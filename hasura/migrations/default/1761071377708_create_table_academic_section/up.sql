CREATE TABLE "academic"."section" ("id" uuid NOT NULL, "name" text NOT NULL, "batch_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "capacity" integer, PRIMARY KEY ("id") , FOREIGN KEY ("batch_id") REFERENCES "academic"."batch"("id") ON UPDATE restrict ON DELETE cascade, UNIQUE ("batch_id", "name"));
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
CREATE TRIGGER "set_academic_section_updated_at"
BEFORE UPDATE ON "academic"."section"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_section_updated_at" ON "academic"."section"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
