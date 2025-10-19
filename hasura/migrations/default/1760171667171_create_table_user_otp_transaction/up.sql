CREATE TABLE "user"."otp_transaction" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "identifier" text NOT NULL, "identifier_type" text NOT NULL, "purpose" text NOT NULL, "otp_hash" text NOT NULL, "attempts" integer NOT NULL DEFAULT 0, "expires_at" timestamptz NOT NULL, "verified" boolean NOT NULL DEFAULT false, "verified_at" timestamptz NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );COMMENT ON TABLE "user"."otp_transaction" IS E'Stores OTP codes for authentication flows';
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
CREATE TRIGGER "set_user_otp_transaction_updated_at"
BEFORE UPDATE ON "user"."otp_transaction"
FOR EACH ROW
EXECUTE PROCEDURE "user"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_user_otp_transaction_updated_at" ON "user"."otp_transaction"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
