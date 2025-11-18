alter table "user"."profile" add column "updated_at" timestamptz
 not null default now();

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
CREATE TRIGGER "set_user_profile_updated_at"
BEFORE UPDATE ON "user"."profile"
FOR EACH ROW
EXECUTE PROCEDURE "user"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_user_profile_updated_at" ON "user"."profile"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
