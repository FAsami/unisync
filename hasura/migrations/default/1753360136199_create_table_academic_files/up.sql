CREATE TABLE "academic"."files" ("id" serial NOT NULL, "url" text NOT NULL, "name" text NOT NULL, "mimetype" text NOT NULL, "owner" integer NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("owner") REFERENCES "academic"."users"("id") ON UPDATE cascade ON DELETE cascade);
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
CREATE TRIGGER "set_academic_files_updated_at"
BEFORE UPDATE ON "academic"."files"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_files_updated_at" ON "academic"."files"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
