-- ONE-OFF. Run once, by hand, AFTER Hasura is switched off for good.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/one-off/drop-hasura-catalog.sql
--
-- Not a migration: MigrationRunner never runs it (it isn't in db/migrations).
-- While Hasura still runs it needs these objects, and dropping them breaks it.
--
-- Hasura keeps its state in the hdb_catalog schema and adds a trigger named
-- notify_hasura_<event trigger>_<op> to every table with an event trigger (here
-- notification.log). Those triggers would keep queueing rows into
-- hdb_catalog.event_log that nothing reads. This removes them, then the schema.

BEGIN;

DO $$
DECLARE
    t record;
BEGIN
    FOR t IN
        SELECT tg.tgname, n.nspname, c.relname
          FROM pg_trigger tg
          JOIN pg_class c ON c.oid = tg.tgrelid
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE NOT tg.tgisinternal
           AND tg.tgname LIKE 'notify\_hasura\_%'
           AND n.nspname <> 'hdb_catalog'
    LOOP
        EXECUTE format('DROP TRIGGER %I ON %I.%I', t.tgname, t.nspname, t.relname);
        RAISE NOTICE 'dropped trigger % on %.%', t.tgname, t.nspname, t.relname;
    END LOOP;
END $$;

DROP SCHEMA IF EXISTS hdb_catalog CASCADE;

COMMIT;
