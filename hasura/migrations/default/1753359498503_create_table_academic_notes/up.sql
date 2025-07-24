CREATE TABLE "academic"."notes" ("id" serial NOT NULL, "owner_id" integer NOT NULL, "class_id" integer, "lecture_id" integer, "title" text NOT NULL, "content" jsonb, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("owner_id") REFERENCES "academic"."users"("id") ON UPDATE cascade ON DELETE cascade, FOREIGN KEY ("class_id") REFERENCES "academic"."classes"("id") ON UPDATE set default ON DELETE set default, FOREIGN KEY ("lecture_id") REFERENCES "academic"."lectures"("id") ON UPDATE set default ON DELETE set default);
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
CREATE TRIGGER "set_academic_notes_updated_at"
BEFORE UPDATE ON "academic"."notes"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_notes_updated_at" ON "academic"."notes"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
