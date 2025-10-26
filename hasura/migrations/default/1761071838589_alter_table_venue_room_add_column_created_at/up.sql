alter table "venue"."room" add column "created_at" timestamptz
 null default now();
