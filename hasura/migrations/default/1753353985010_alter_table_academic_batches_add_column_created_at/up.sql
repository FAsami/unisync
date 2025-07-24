alter table "academic"."batches" add column "created_at" timestamptz
 null default now();
