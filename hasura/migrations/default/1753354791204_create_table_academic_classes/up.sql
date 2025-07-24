CREATE TABLE "academic"."classes" ("id" serial NOT NULL, "name" text NOT NULL, "code" text NOT NULL, "room" text NOT NULL, "schedule" jsonb NOT NULL, "batch_id" integer NOT NULL, "section_id" integer NOT NULL, "semester_id" integer NOT NULL, "department_id" Integer NOT NULL, "teacher_id" integer NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("batch_id") REFERENCES "academic"."batches"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("teacher_id") REFERENCES "academic"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("department_id") REFERENCES "academic"."departments"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("semester_id") REFERENCES "academic"."semesters"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("section_id") REFERENCES "academic"."sections"("id") ON UPDATE restrict ON DELETE restrict);
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
CREATE TRIGGER "set_academic_classes_updated_at"
BEFORE UPDATE ON "academic"."classes"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_classes_updated_at" ON "academic"."classes"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
