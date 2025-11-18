alter table "academic"."class_representative" add column "created_at" timestamptz
 null default now();
