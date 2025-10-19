CREATE TABLE "user"."otp_rate_limit" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "identifier" text NOT NULL, "identifier_type" text NOT NULL, "attempt_count" integer NOT NULL DEFAULT 1, "window_start" timestamptz NOT NULL DEFAULT now(), "action_type" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("identifier", "action_type", "window_start"));COMMENT ON TABLE "user"."otp_rate_limit" IS E'Tracks rate limits for OTP operations';
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
CREATE TRIGGER "set_user_otp_rate_limit_updated_at"
BEFORE UPDATE ON "user"."otp_rate_limit"
FOR EACH ROW
EXECUTE PROCEDURE "user"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_user_otp_rate_limit_updated_at" ON "user"."otp_rate_limit"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
