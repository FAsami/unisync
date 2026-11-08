# UniSync web

The department admin's setup tool and the public pages (landing, account
deletion). It uses only the UniSync .NET API; see `CLAUDE.md` for how it is
put together.

```bash
cp .env.example .env.local   # set API_URL to the API's origin
yarn install
yarn dev                     # http://localhost:3000
```

Sign in at `/auth/login` with a department admin's number. The first admin is
created with the API's `create-admin` command (see `api/CLAUDE.md`).
