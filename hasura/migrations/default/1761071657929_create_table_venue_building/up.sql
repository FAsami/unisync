CREATE TABLE "venue"."building" ("id" uuid NOT NULL, "name" text NOT NULL, "code" text NOT NULL, "address" text NOT NULL, "latitude" integer NOT NULL, "longitude" integer NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("code"));
CREATE OR REPLACE FUNCTION "venue"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_venue_building_updated_at"
BEFORE UPDATE ON "venue"."building"
FOR EACH ROW
EXECUTE PROCEDURE "venue"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_venue_building_updated_at" ON "venue"."building"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
