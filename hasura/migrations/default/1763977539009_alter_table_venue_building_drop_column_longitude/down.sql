alter table "venue"."building" alter column "longitude" drop not null;
alter table "venue"."building" add column "longitude" numeric;
