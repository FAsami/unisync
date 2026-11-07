---
name: hasura-change
description: Change the database schema, Hasura permissions, relationships, actions or event triggers in hasura/, and keep server and mobile codegen in sync. Use for any edit under hasura/ or any new table, column or role permission.
---

# Change Hasura schema or metadata

## Rules

- **Never edit a committed `up.sql`.** It may already be applied in some environment. The guard hook blocks it. Create a new migration instead.
- Every migration needs a working `down.sql`.
- `admin` is Hasura's built-in superuser: it is never listed in metadata and bypasses every permission. Don't add new behaviour that relies on users holding the `admin` role. Prefer a scoped role.
- `guest-consumer` tokens are public (`POST /api/v1/auth/session/guest`). Treat that role as "anyone on the internet".
- Never grant a non-admin role `password`, `access_token`, `refresh_token` or `otp_hash`. `scripts/check-hasura-metadata.py` enforces this.
- Event triggers and actions must send the `SERVER-AUTH-SECRET` header (`value_from_env: SERVER_AUTH_SECRET`). The server rejects calls without it.

## Workflow

```bash
docker-compose up -d                       # Postgres :9200, Hasura :9203
cd hasura
export HASURA_GRAPHQL_ENDPOINT=http://localhost:9203 HASURA_GRAPHQL_ADMIN_SECRET=123
hasura migrate apply --database-name default
hasura metadata apply
hasura console                             # make changes here; the CLI writes migrations and metadata files
```

Or write the changes by hand:

1. `hasura migrate create <snake_name> --database-name default`, then fill in `up.sql` and `down.sql`.
2. Edit `metadata/databases/default/tables/<schema>_<table>.yaml`. A new table also needs an entry in `tables.yaml`.
3. `hasura migrate apply --database-name default && hasura metadata apply && hasura metadata ic list`. The inconsistency list must be empty.
4. Regenerate typed clients against the running Hasura:
   - `cd server && yarn codegen`
   - `cd mobile && yarn generate-types` (needs `DATAHUB` and `HASURA_ADMIN_SECRET` in `mobile/.env`)
5. `python3 scripts/check-hasura-metadata.py`, then `scripts/check-all.sh`.

## Permission review checklist

For each role you touched:
- **select:** is `filter` scoped, e.g. `{"user_id": {"_eq": "X-Hasura-User-Id"}}`, or is `{}` really intended? Do the columns include anything sensitive?
- **insert / update:** is there a `check` so users can't write rows that belong to someone else? Are `set` presets used for `created_by` and `user_id`?
- **delete:** should it be a soft delete (`deleted_at`) instead?
- Does any server query that lists users need `deleted_at: { _is_null: true }`?
