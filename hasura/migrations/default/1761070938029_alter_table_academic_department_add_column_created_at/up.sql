alter table "academic"."department" add column "created_at" timestamptz
 null default now();
