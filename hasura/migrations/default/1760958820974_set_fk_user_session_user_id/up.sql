alter table "user"."session"
  add constraint "session_user_id_fkey"
  foreign key ("user_id")
  references "user"."account"
  ("id") on update no action on delete cascade;
