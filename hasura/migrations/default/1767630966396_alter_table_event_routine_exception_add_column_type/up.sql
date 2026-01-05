alter table "event"."routine_exception" add column "type" text
 not null default 'cancellation';
