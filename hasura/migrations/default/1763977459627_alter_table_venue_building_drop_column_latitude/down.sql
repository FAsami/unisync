alter table "venue"."building" alter column "latitude" drop not null;
alter table "venue"."building" add column "latitude" numeric;
