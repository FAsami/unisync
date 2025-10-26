alter table "academic"."department" alter column "id" set default gen_random_uuid();
alter table "academic"."batch" alter column "id" set default gen_random_uuid();
alter table "academic"."section" alter column "id" set default gen_random_uuid();
alter table "academic"."course" alter column "id" set default gen_random_uuid();
alter table "academic"."course_offering" alter column "id" set default gen_random_uuid();
alter table "academic"."user_enrollment" alter column "id" set default gen_random_uuid();
alter table "academic"."class_representative" alter column "id" set default gen_random_uuid();
