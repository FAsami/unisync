# Deployment

| Part | Where | How it deploys |
| --- | --- | --- |
| API | Fly.io app `unisync-api` (`api/fly.toml`) | `.github/workflows/deploy-api.yml` runs on pushes to `main` that touch `api/`, once the repository variable `API_DEPLOY_ENABLED` is `true`. It runs the tests, then `flyctl deploy`. Migrations run as Fly's release command before the new version takes traffic. |
| Web | Vercel | Vercel builds `web/` on every push to `main`; set `API_URL` (the API's origin) and `API_PROXY_SECRET` |
| Docs | GitHub Pages | `.github/workflows/deploy-docs.yml` |
| Mobile | App stores (EAS builds) | `eas build` with `API_URL` set in the EAS environment |

## API configuration

Production settings are Fly secrets, never committed:

| Secret | What |
| --- | --- |
| `ConnectionStrings__Default` | Npgsql connection string to the production database |
| `Auth__JwtSecret` | Token signing secret, at least 32 characters |
| `Sms__ApiKey`, `Sms__SecretKey`, `Sms__CallerId` | BulkSMSBD credentials |
| `Push__FcmServiceAccountJson` | Firebase service-account JSON, raw or base64 |
| `Push__Enabled` | `true` to deliver pushes |
| `RateLimits__TrustedProxySecret` | 32+ random characters; the same value is `API_PROXY_SECRET` in Vercel, so sign-in limits apply per visitor |

The API refuses to start when a required setting is missing or invalid. For
example, push turned on without a usable Firebase key, or the console SMS
sender outside Development.

To create the first admin in production:

```bash
fly ssh console -a unisync-api -C "dotnet UniSync.Api.dll create-admin --phone ... --first-name ... \
  --last-name ... --department-code ... --department-name '...'"
```

## Switching production over

Production ran on Hasura Cloud and the Node server before this API existed.
[`CUTOVER.md`](https://github.com/FAsami/unisync/blob/main/CUTOVER.md) in the
repository is the step-by-step runbook for moving it, with how to undo each
step:

1. create the Fly app
2. deploy and migrate
3. point the web app at the API
4. ship the mobile app
5. move push delivery to the API
6. retire Hasura and the old server
