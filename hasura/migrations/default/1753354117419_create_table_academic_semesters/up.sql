CREATE TABLE "academic"."semesters" ("id" serial NOT NULL, "name" text NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );
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
CREATE TRIGGER "set_academic_semesters_updated_at"
BEFORE UPDATE ON "academic"."semesters"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_semesters_updated_at" ON "academic"."semesters"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
