alter table "user"."faculty" add column "created_at" timestamptz
 null default now();
