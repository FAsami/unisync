alter table "academic"."department" add column "updated_at" timestamptz
 null default now();

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
CREATE TRIGGER "set_academic_department_updated_at"
BEFORE UPDATE ON "academic"."department"
FOR EACH ROW
EXECUTE PROCEDURE "academic"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_academic_department_updated_at" ON "academic"."department"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
