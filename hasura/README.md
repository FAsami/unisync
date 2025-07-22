# Hasura GraphQL

GraphQL API with PostgreSQL backend.

## Database Schema

### user.session table

```sql
CREATE TABLE "user"."session" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" integer,
  "access_token" text NOT NULL,
  "access_token_expires_at" timestamptz NOT NULL,
  "refresh_token" text NOT NULL,
  "refresh_token_expires_at" timestamptz NOT NULL,
  "revoked" boolean NOT NULL DEFAULT false,
  "ip_address" text NOT NULL,
  "device_info" jsonb,
  "user_agent" text NOT NULL,
  "last_used_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("access_token"),
  UNIQUE ("refresh_token")
);
```

## Migrations

- `1752999969469_create_schema_user` - Creates user schema
- `1753001604766_create_table_user_session` - Creates session table

## Configuration

- Database URL: postgres://postgres:postgrespassword@postgres:5432/unisync
- Admin Secret: 123
- Auth Hook: http://host.docker.internal:9201/api/v1/auth/webhook/authorize
- Console: http://localhost:9203

## Commands

```bash
# Apply migrations
hasura migrate apply

# Apply metadata
hasura metadata apply

# Check status
hasura migrate status
```
