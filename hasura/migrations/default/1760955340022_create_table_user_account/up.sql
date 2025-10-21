CREATE TABLE "user"."account" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "phone" text NOT NULL, "email" text NOT NULL, "phone_verfied_at" timestamptz, "email_verfied_at" timestamptz, "role" text NOT NULL DEFAULT 'consumer', "password" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("phone"));
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
CREATE TRIGGER "set_user_account_updated_at"
BEFORE UPDATE ON "user"."account"
FOR EACH ROW
EXECUTE PROCEDURE "user"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_user_account_updated_at" ON "user"."account"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
