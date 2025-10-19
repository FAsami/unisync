CREATE TABLE "settings"."config" ("id" serial NOT NULL, "identifier" text NOT NULL, "scope" text NOT NULL, "value" jsonb, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("identifier", "scope"));COMMENT ON TABLE "settings"."config" IS E'This will store configuration across all the available platforms';
CREATE OR REPLACE FUNCTION "settings"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_settings_config_updated_at"
BEFORE UPDATE ON "settings"."config"
FOR EACH ROW
EXECUTE PROCEDURE "settings"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_settings_config_updated_at" ON "settings"."config"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
