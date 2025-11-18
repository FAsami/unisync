CREATE TABLE "academic"."course_offering" ("id" uuid NOT NULL, "course_id" uuid NOT NULL, "batch_id" uuid NOT NULL, "section_id" uuid NOT NULL, "teacher_id" uuid NOT NULL, "academic_year" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("course_id") REFERENCES "academic"."course"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("batch_id") REFERENCES "academic"."batch"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("section_id") REFERENCES "academic"."section"("id") ON UPDATE no action ON DELETE set null, FOREIGN KEY ("teacher_id") REFERENCES "user"."account"("id") ON UPDATE no action ON DELETE cascade);COMMENT ON TABLE "academic"."course_offering" IS E'Course instance for batched/sections';
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
CREATE TRIGGER "set_academic_course_offering_updated_at"
BEFORE UPDATE ON "academic"."course_offering"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_course_offering_updated_at" ON "academic"."course_offering"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
