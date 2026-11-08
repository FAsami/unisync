# Cut-over: from Hasura + `server/` to `api/`

The repository no longer needs Hasura or the Node server: the .NET API (`api/`)
owns the schema, sign-in, data, setup and push delivery, and both apps call only
it. Production still runs the old stack until you do the steps below, in order.
Each step says how to undo it. There are no real users yet, so a short gap is
acceptable, but do steps 2–4 in one sitting.

Values in `<angle brackets>` are yours. Never paste secrets into commits or chat.

## 0. Before you start

- Find the production database URL: Hasura Cloud → your project → Env vars
  (`HASURA_GRAPHQL_DATABASE_URL` or the PG_DATABASE_URL it references), or the
  Neon / provider dashboard it points to. **Check where that database lives.**
  If it was created from Hasura Cloud's "Neon" button it lives in your Neon
  account, and deleting the Hasura project later does not delete it. Make sure
  that's true before step 6.
- Take a backup: `pg_dump "<database-url>" -Fc -f unisync-before-cutover.dump`
- Have the BulkSMSBD API key, secret key and caller id, and the Firebase
  service-account JSON (Firebase console → Project settings → Service accounts →
  Generate new private key, or the one the Node server uses).

## 1. Create the API app on Fly (nothing changes for users)

```bash
cd api
fly apps create unisync-api            # name must match api/fly.toml
fly secrets set -a unisync-api \
  ConnectionStrings__Default="Host=<host>;Port=5432;Database=<db>;Username=<user>;Password=<password>;SSL Mode=Require" \
  Auth__JwtSecret="<at least 32 characters>" \
  Sms__ApiKey="<key>" Sms__SecretKey="<secret>" Sms__CallerId="<caller id>" \
  Push__FcmServiceAccountJson="$(base64 -w0 < service-account.json)" \
  RateLimits__TrustedProxySecret="$(openssl rand -hex 32)"
```

- `RateLimits__TrustedProxySecret`: the web app forwards each visitor's address with
  this secret, so sign-in limits apply per visitor rather than to the web server as a
  whole. Copy the value for step 3 (`fly secrets list` won't show it again).

- `Auth__JwtSecret`: if you still have the Node server's `JWT_SECRET`, reuse it and
  existing sessions stay valid. Fly can't show it back to you (`fly secrets list`
  only shows a digest). A new secret is fine: everyone signs in again.
- Then enable deploys: GitHub → Settings → Secrets and variables → Actions →
  Variables → `API_DEPLOY_ENABLED` = `true`. The `FLY_API_TOKEN` secret the server
  deploy uses is reused.

Undo: `fly apps destroy unisync-api`, delete the variable.

## 2. Deploy and migrate (the old apps keep working)

Run "Deploy API to Fly.io" from the Actions tab (or `cd api && fly deploy`).
Before the new version starts, Fly runs `migrate`. On the existing database it
records the Hasura schema as its baseline without touching it, then applies
`0001`–`0006`:

- passwords become optional, and class times become plain campus-local `time`
- new tables for access requests and inbox read state
- new columns for class changes and department admins

The old apps keep working. Afterwards press **Reload metadata** in the Hasura
console so it sees the changed column types.

Check:

```bash
curl https://unisync-api.fly.dev/api/v1/health/ready     # {"success":true,...}
fly ssh console -a unisync-api -C "dotnet UniSync.Api.dll create-admin \
  --phone <your number> --first-name <first> --last-name <last> \
  --department-code <CSE> --department-name '<Computer Science and Engineering>'"
```

Undo: the migrations are additive except the two type changes above. Restore the
backup if you need the exact old schema.

## 3. Point the web app at the API

Vercel → unisync → Settings → Environment Variables:

- set `API_URL` = `https://unisync-api.fly.dev`
- set `API_PROXY_SECRET` = the `RateLimits__TrustedProxySecret` value from step 1
- remove `NEXT_PUBLIC_HASURA_ENDPOINT` and `NEXT_PUBLIC_API_URL`
- redeploy

Sign in at https://www.uni-sync.site/auth/login with the number from step 2 and
set up the department: batches, sections, courses, teachers, then import the
roster, add offerings and the weekly routine.

Undo: redeploy the previous Vercel deployment ("Promote to production").

## 4. Ship the mobile app on the API

- Set `API_URL=https://unisync-api.fly.dev` for EAS builds: EAS → Project →
  Environment variables, or `eas env:create`.
- Make new builds with `eas build -p all --profile production` and submit them. The
  native dependencies changed (Apollo and the Hasura client are gone), so use a
  store build rather than a CodePush update.
- Older installed builds still call Hasura and the Node server. Keep those
  running until the new build is live (steps 5 and 6 come after).

Undo: keep the old build live in the stores.

## 5. Move push delivery to the API

Do this when the new mobile build is the one people use.

1. Stop Hasura sending. In the Hasura console, go to Events → `sendNotification`
   (on `notification.log`) and delete the trigger. Or go straight to step 6.
2. Start the API sending: `fly secrets set -a unisync-api Push__Enabled=true`.
   The machines restart. Startup fails loudly if the Firebase key is missing or invalid.
3. Send a test from the web or mobile "Send" screen and check that it arrives.
   In the database, the row in `notification.log` should end as `sent`.

Undo: `fly secrets set -a unisync-api Push__Enabled=false` and recreate the trigger.

## 6. Retire Hasura and the Node server

1. Delete the Hasura Cloud project. First re-check step 0: the database must not
   go with it.
2. Remove Hasura's leftovers from the database:
   `psql "<database-url>" -f api/db/one-off/drop-hasura-catalog.sql`
3. `fly apps destroy unisync-server`
4. Give the API its domain. `api.uni-sync.site` currently answers Cloudflare 530:
   `fly certs add api.uni-sync.site -a unisync-api`, then in Cloudflare point
   `api` with a CNAME to `unisync-api.fly.dev`. Use DNS-only, or keep the proxy
   with SSL mode "Full". Then change `API_URL` in Vercel and EAS to
   `https://api.uni-sync.site`.
5. Remove the old secrets: the `SERVER_AUTH_SECRET` and `HASURA_*` values in Vercel
   and EAS, and the `HASURA_*` secrets in GitHub, if any.

This step can't be undone (except by restoring the backup into a new Hasura
project), which is why it comes last.
