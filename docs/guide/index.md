# Getting started

UniSync helps a university department run its class routine. The routine is
set up once on the web. Everything that happens on the day of a class happens
on the phone: a teacher cancels, moves or re-rooms a class, and every student
in the section gets a notice and sees the change in "My day".

## Who uses what

| Role | App | What they do |
| --- | --- | --- |
| **Student** | Mobile | "My day" (now and next), the week, class changes as they happen, the notice inbox |
| **Class representative (CR)** | Mobile | Everything a student does, plus changing their own section's classes and sending notices to it. CR is a mark on a student, not a separate role. |
| **Teacher** | Mobile | Their own classes, changing them, and sending notices to the sections they teach |
| **Department admin** | Web (and mobile for notices) | Sets up the department, keeps the roster, approves access requests, and sends notices to the department, a batch or a section |

There is no university-wide admin. Each department admin manages only their
own department. The first admin of a department is created from the command
line (see [Installation](./installation#_4-create-the-first-department-admin)).

## Signing in

There are no passwords.

1. The person enters their mobile number.
2. If the number is on a department's roster, an SMS code is sent. Entering the code signs them in.
3. If it isn't, the app offers **Request access**. They verify the number with a code and choose their department, batch and section. The department admin approves or rejects the request on the web, and approval adds them to the roster.

Details are in [Authentication](/api/authentication).

## How the pieces fit

```
mobile (Expo) ──┐
                ├──▶  api/ (ASP.NET Core)  ──▶  PostgreSQL
web (Next.js) ──┘          │
                           ├──▶  BulkSMSBD (sign-in codes)
                           └──▶  Firebase Cloud Messaging (pushes)
```

- The **API** is the only backend. It owns the database schema
  (`api/db/migrations`), and its contract is `api/openapi/v1.json`.
- **Mobile** calls the API directly with a typed client generated from that contract.
- **Web** calls it through its own server. The browser never holds tokens.

## Next steps

- [Installation](./installation): run everything locally
- [Department setup](./department-setup): what an admin does on the web, in order
- [Mobile app](./mobile-app): what each role sees
- [Deployment](./deployment): where production runs
- [Architecture](/architecture/overview)
