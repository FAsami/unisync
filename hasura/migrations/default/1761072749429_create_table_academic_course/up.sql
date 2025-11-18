CREATE TABLE "academic"."course" ("id" uuid NOT NULL, "department_id" uuid NOT NULL, "code" text NOT NULL, "name" text NOT NULL, "description" text NOT NULL, "credit_hours" numeric NOT NULL, "semester" integer NOT NULL, "course_type" text NOT NULL DEFAULT 'THEORY', "syllabus_url" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("department_id") REFERENCES "academic"."department"("id") ON UPDATE no action ON DELETE cascade, UNIQUE ("department_id", "code"));COMMENT ON TABLE "academic"."course" IS E'Course catelog';
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
CREATE TRIGGER "set_academic_course_updated_at"
BEFORE UPDATE ON "academic"."course"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_course_updated_at" ON "academic"."course"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
