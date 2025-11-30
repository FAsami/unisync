CREATE TABLE "user"."faculty" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "first_name" text, "last_name" text, "designation" text NOT NULL, "faculty_id" uuid NOT NULL, "department_id" uuid NOT NULL, "description" jsonb, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;
