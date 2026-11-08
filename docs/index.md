---
layout: home

hero:
  name: "UniSync"
  text: "Documentation"
  tagline: Class routines, same-day class changes and notices for a university department
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: 📱 Mobile app
    details: Students and teachers see "My day" and the week, get a notice for every class change, and keep an inbox. Teachers and class representatives cancel, move or re-room a class in two taps.
  - title: 🖥️ Web dashboard
    details: A department admin sets up batches, sections, courses, teachers, the student roster and the weekly routine, and approves access requests.
  - title: 🔑 Passwordless sign-in
    details: Students and teachers sign in with a code sent by SMS to the number on their department's roster. Numbers not on it can request access.
  - title: ⚙️ One .NET API
    details: ASP.NET Core 10 with EF Core and PostgreSQL. It owns the schema, sign-in, data and push delivery, and publishes an OpenAPI contract both apps generate their clients from.
---

## Quick start

```bash
docker-compose up -d postgres          # PostgreSQL on localhost:9200

cd api
dotnet run --project src/UniSync.Api -- migrate
dotnet run --project src/UniSync.Api   # http://localhost:9202, SMS codes print to the log

cd ../mobile && yarn install && yarn start
cd ../web && yarn install && yarn dev  # http://localhost:3000
```

See [Installation](/guide/installation) for the full setup, including the first department admin.

## Project structure

| Directory | What |
| --- | --- |
| `api/` | The backend: ASP.NET Core 10 API, its SQL migrations and tests |
| `mobile/` | Expo (React Native) app for students, teachers and class representatives |
| `web/` | Next.js dashboard for department admins, plus the landing page |
| `docs/` | This site (VitePress), published to GitHub Pages |
