# Database schema

PostgreSQL. The schema is owned by the API's migrations in
[`api/db/migrations`](https://github.com/FAsami/unisync/tree/main/api/db/migrations).
Those files are the source of truth, so this page is a map of them, not a copy.

## Migrations

| File | What it does |
| --- | --- |
| `0000_baseline.sql` | The schema as it was before the API: schemas, tables, `updated_at` triggers |
| `0001_passwordless_sign_in.sql` | `user.account.password` becomes optional |
| `0002_access_requests.sql` | `user.access_request`; `user.account.managed_department_id` for department admins |
| `0003_my_day_schedule.sql` | Routine times become campus-local `time`; a room per routine slot; class-change types and their fields; one change per class per day |
| `0004_notification_inbox.sql` | `notification.read` (per-person read state); inbox indexes |
| `0006_department_setup.sql` | Teachers no longer need a faculty grouping; an index for routine clash checks |

How migrations run:

- `MigrationRunner` applies them in name order, once each, under an advisory
  lock, and records them in `api.schema_migrations`.
- Run them with `dotnet UniSync.Api.dll migrate`. In production, Fly runs this
  as the release command.
- On a database that already has the baseline schema, `0000` is recorded
  without running.
- A committed migration is never edited. Changes go in a new file.

## Tables the API uses

### `user`

| Table | Purpose |
| --- | --- |
| `account` | One per person: `phone` (unique, E.164), `role` (`student`, `teacher`, `admin`), `is_active`, `deleted_at` (soft delete), `managed_department_id` (admins) |
| `profile` | Names, student ID, and the student's department, batch and section |
| `faculty` | A teacher's record in a department: designation and names |
| `session` | One row per sign-in. Its id is the token's `sessionId`. Holds `revoked` and expiry times. |
| `otp_transaction` | Hashed one-time codes with purpose, attempts and expiry |
| `device` | Push tokens, one row per app install (`device_id`), with `is_active` |
| `access_request` | Requests to join from numbers not on a roster: `pending`, `approved` or `rejected` |

### `academic`

| Table | Purpose |
| --- | --- |
| `department` | `code` (upper case), name, description |
| `batch` | An intake in a department: year, current semester, number of semesters. Note the column `departmant_id` (sic). |
| `section` | A section of a batch |
| `course` | A department's course: code, credit hours, semester, type |
| `course_offering` | Course × section × teacher for an academic year |
| `class_representative` | The CR mark on a student for a section |

### `event`

| Table | Purpose |
| --- | --- |
| `routine` | A weekly slot of an offering: `day_of_week` (0 = Sunday), campus-local `start_time` and `end_time`, `room_id`, and the dates it applies between |
| `routine_exception` | One change per class per date: `cancellation`, `reschedule` (new date and times, optional room) or `room_change` (new room). The database checks the fields match the type. |

### `notification`

| Table | Purpose |
| --- | --- |
| `log` | Every notice: title, body, audience (`target_type` + `target_id`), `data`, sender, and push delivery status. See [Notification system](./notification-system). |
| `read` | Who has read which notice |

### `venue`

| Table | Purpose |
| --- | --- |
| `building` | Name, code, address |
| `room` | Room number and name, floor, capacity, in a building |

## Legacy tables

The baseline also has tables the API doesn't use:

- the `event.event*` family (`event`, `event_attachment`, `event_attendance`,
  `event_cancellation`, `event_change`, `event_instructor`, `event_participant`,
  `event_room`, `event_target`) and `event.group_assignment`
- `user.otp_rate_limit` (the API rate-limits in memory)
- `settings.config`
- `academic.faculty`, with `academic.department.faculty_id`
- `user.account.password`

They can be dropped in a later migration once production has been switched over.
