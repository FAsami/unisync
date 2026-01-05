CREATE TABLE "user"."device" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "device_id" text NOT NULL, "provider" text NOT NULL, "token" text NOT NULL, "platform" text NOT NULL, "is_active" boolean NOT NULL, "last_used_at" timestamptz NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "user"."account"("id") ON UPDATE cascade ON DELETE cascade, UNIQUE ("user_id", "device_id", "provider"));
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
CREATE TRIGGER "set_user_device_updated_at"
BEFORE UPDATE ON "user"."device"
FOR EACH ROW
EXECUTE PROCEDURE "user"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_user_device_updated_at" ON "user"."device"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
