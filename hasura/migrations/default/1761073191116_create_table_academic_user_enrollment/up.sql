CREATE TABLE "academic"."user_enrollment" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "course_offering_id" uuid NOT NULL, "status" text NOT NULL DEFAULT 'ENROLLED', "enrolled_at" timestamptz NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("course_offering_id") REFERENCES "academic"."course_offering"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("user_id") REFERENCES "user"."account"("id") ON UPDATE restrict ON DELETE cascade);COMMENT ON TABLE "academic"."user_enrollment" IS E'Students course enrollments';
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
CREATE TRIGGER "set_academic_user_enrollment_updated_at"
BEFORE UPDATE ON "academic"."user_enrollment"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_user_enrollment_updated_at" ON "academic"."user_enrollment"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
