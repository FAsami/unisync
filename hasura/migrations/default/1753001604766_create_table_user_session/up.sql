CREATE TABLE "user"."session" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" integer, "access_token" text NOT NULL, "access_token_expires_at" timestamptz NOT NULL, "refresh_token" text NOT NULL, "refresh_token_expires_at" timestamptz NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "ip_address" text NOT NULL, "device_info" jsonb, "user_agent" text NOT NULL, "last_used_at" timestamptz NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("access_token"), UNIQUE ("refresh_token"));
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
CREATE TRIGGER "set_user_session_updated_at"
BEFORE UPDATE ON "user"."session"
FOR EACH ROW
EXECUTE PROCEDURE "user"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_user_session_updated_at" ON "user"."session"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
