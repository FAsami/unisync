CREATE TABLE "academic"."users" ("id" serial NOT NULL, "name" text NOT NULL, "avatar" text NOT NULL, "role" text NOT NULL DEFAULT 'STUDENT', "batch_id" integer, "section_id" integer, "department_id" integer, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("batch_id") REFERENCES "academic"."batches"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("section_id") REFERENCES "academic"."sections"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("department_id") REFERENCES "academic"."departments"("id") ON UPDATE restrict ON DELETE restrict);
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
CREATE TRIGGER "set_academic_users_updated_at"
BEFORE UPDATE ON "academic"."users"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_users_updated_at" ON "academic"."users"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
