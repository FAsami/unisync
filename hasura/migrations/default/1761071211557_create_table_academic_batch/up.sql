CREATE TABLE "academic"."batch" ("id" uuid NOT NULL, "departmant_id" uuid NOT NULL, "name" text NOT NULL, "current_semester" integer NOT NULL, "year" integer NOT NULL, "semester_count" integer NOT NULL, "start_date" date, "end_date" date, "is_active" boolean NOT NULL DEFAULT true, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("departmant_id") REFERENCES "academic"."department"("id") ON UPDATE cascade ON DELETE cascade);
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
CREATE TRIGGER "set_academic_batch_updated_at"
BEFORE UPDATE ON "academic"."batch"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_batch_updated_at" ON "academic"."batch"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
