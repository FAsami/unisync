CREATE TABLE "academic"."lectures" ("id" serial NOT NULL, "class_id" integer NOT NULL, "lecturer_id" integer NOT NULL, "topic" text, "status" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("class_id") REFERENCES "academic"."classes"("id") ON UPDATE restrict ON DELETE restrict);
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
CREATE TRIGGER "set_academic_lectures_updated_at"
BEFORE UPDATE ON "academic"."lectures"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_lectures_updated_at" ON "academic"."lectures"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
