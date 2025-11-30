alter table "user"."faculty" add column "updated_at" timestamptz
 null default now();

CREATE OR REPLACE FUNCTION "user"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_user_faculty_updated_at"
BEFORE UPDATE ON "user"."faculty"
FOR EACH ROW
EXECUTE PROCEDURE "user"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_user_faculty_updated_at" ON "user"."faculty"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
