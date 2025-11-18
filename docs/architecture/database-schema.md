# Event & Notification System - Database Schema

Complete database schema reference for the event management and notification system.

## Schema Overview

- **event** - Event management (lectures, exams, labs, seminars)
- **notification** - Multi-channel notification system (SMS, Push)
- **venue** - Buildings and rooms (existing)
- **academic** - Courses, batches, sections (existing)

---

## Event Schema

### 1. event.routine

Weekly recurring patterns for regular lectures.

```sql
CREATE SCHEMA IF NOT EXISTS event;

CREATE TABLE event.routine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course_offering_id uuid NOT NULL REFERENCES academic.course_offering(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  event_type text DEFAULT 'lecture',
  effective_from date NOT NULL,
  effective_to date,
  is_active boolean DEFAULT true,
  metadata jsonb,
  created_by uuid REFERENCES user.account(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_routine UNIQUE(course_offering_id, day_of_week, start_time, effective_from)
);

CREATE INDEX idx_routine_course ON event.routine(course_offering_id);
CREATE INDEX idx_routine_day ON event.routine(day_of_week);
CREATE INDEX idx_routine_active ON event.routine(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION event.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_event_routine_updated_at
BEFORE UPDATE ON event.routine
FOR EACH ROW
EXECUTE PROCEDURE event.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `name` - Routine name (e.g., "CSE 301 Monday Lecture")
- `course_offering_id` - Links to course offering
- `day_of_week` - 0=Sunday, 1=Monday, ..., 6=Saturday
- `start_time` - Start time (e.g., '10:00')
- `end_time` - End time (e.g., '11:00')
- `event_type` - Default event type for generated events
- `effective_from` - When routine starts
- `effective_to` - When routine ends (nullable = ongoing)
- `is_active` - Active status
- `metadata` - Additional JSON data
- `created_by` - User who created
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
INSERT INTO event.routine (name, course_offering_id, day_of_week, start_time, end_time, effective_from, created_by)
VALUES ('CSE 301 Monday Lecture', 'course-uuid', 1, '10:00', '11:00', '2025-01-06', 'admin-uuid');
```

---

### 2. event.event

Main events table for all academic events.

```sql
CREATE TABLE event.event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK(event_type IN (
    'lecture', 'exam', 'practical', 'tutorial', 'seminar',
    'workshop', 'meeting', 'other'
  )),
  title text NOT NULL,
  description text,
  course_offering_id uuid REFERENCES academic.course_offering(id) ON DELETE SET NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration_minutes integer GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 60
  ) STORED,
  status text NOT NULL DEFAULT 'scheduled' CHECK(status IN (
    'scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'
  )),
  priority text DEFAULT 'normal' CHECK(priority IN ('urgent', 'normal', 'low')),
  routine_id uuid REFERENCES event.routine(id) ON DELETE SET NULL,
  metadata jsonb,
  created_by uuid NOT NULL REFERENCES user.account(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_date ON event.event(date);
CREATE INDEX idx_event_date_time ON event.event(date, start_time);
CREATE INDEX idx_event_course ON event.event(course_offering_id);
CREATE INDEX idx_event_type_status ON event.event(event_type, status);
CREATE INDEX idx_event_routine ON event.event(routine_id);
CREATE INDEX idx_event_created_by ON event.event(created_by);

CREATE TRIGGER set_event_event_updated_at
BEFORE UPDATE ON event.event
FOR EACH ROW
EXECUTE PROCEDURE event.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `event_type` - Type: lecture, exam, practical, tutorial, seminar, workshop, meeting, other
- `title` - Event title (e.g., "CSE 301 - Data Structures")
- `description` - Detailed description
- `course_offering_id` - Links to course (nullable for non-course events)
- `date` - Event date
- `start_time`, `end_time` - Time range
- `duration_minutes` - Auto-calculated duration
- `status` - scheduled, ongoing, completed, cancelled, postponed
- `priority` - urgent (exams), normal (lectures), low (seminars)
- `is_recurring` - Generated from routine?
- `routine_id` - Links to routine if generated
- `metadata` - Additional JSON data
- `created_by` - User who created
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
INSERT INTO event.event (event_type, title, course_offering_id, date, start_time, end_time, priority, created_by)
VALUES ('exam', 'CSE 301 Midterm Exam', 'course-uuid', '2025-02-15', '14:00', '16:00', 'urgent', 'admin-uuid');
```

---

### 3. event.event_target

Group-based targeting (who should see the event).

```sql
CREATE TABLE event.event_target (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES event.event(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK(target_type IN (
    'batch', 'section', 'course_offering', 'department', 'custom'
  )),
  target_id uuid NOT NULL,
  group_identifier text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_target_event ON event.event_target(event_id);
CREATE INDEX idx_event_target_type_id ON event.event_target(target_type, target_id);
CREATE INDEX idx_event_target_group ON event.event_target(target_id, group_identifier)
  WHERE group_identifier IS NOT NULL;
```

**Columns:**

- `id` - Primary key
- `event_id` - Links to event
- `target_type` - batch, section, course_offering, department, custom
- `target_id` - UUID of the target (batch_id, section_id, etc.)
- `group_identifier` - Sub-group name (e.g., "Group 1") for labs
- `created_at` - Timestamp

**Examples:**

```sql
-- Target all students in a course offering
INSERT INTO event.event_target (event_id, target_type, target_id)
VALUES ('event-uuid', 'course_offering', 'course-uuid');

-- Target specific section, specific group
INSERT INTO event.event_target (event_id, target_type, target_id, group_identifier)
VALUES ('event-uuid', 'section', 'section-uuid', 'Group 1');

-- Target multiple batches (seminar)
INSERT INTO event.event_target (event_id, target_type, target_id) VALUES
('event-uuid', 'batch', 'batch-2021-uuid'),
('event-uuid', 'batch', 'batch-2022-uuid');
```

---

### 4. event.group_assignment

Assign students to sub-groups within sections/courses (for labs).

```sql
CREATE TABLE event.group_assignment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user.account(id) ON DELETE CASCADE,
  section_id uuid REFERENCES academic.section(id) ON DELETE CASCADE,
  course_offering_id uuid REFERENCES academic.course_offering(id) ON DELETE CASCADE,
  group_identifier text NOT NULL,
  assigned_by uuid REFERENCES user.account(id),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_group_assignment UNIQUE(user_id, section_id, course_offering_id, group_identifier)
);

CREATE INDEX idx_group_assignment_user ON event.group_assignment(user_id);
CREATE INDEX idx_group_assignment_section ON event.group_assignment(section_id, group_identifier);
CREATE INDEX idx_group_assignment_course ON event.group_assignment(course_offering_id, group_identifier);

CREATE TRIGGER set_event_group_assignment_updated_at
BEFORE UPDATE ON event.group_assignment
FOR EACH ROW
EXECUTE PROCEDURE event.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `user_id` - Student user ID
- `section_id` - Section (for section-level groups)
- `course_offering_id` - Course offering (for course-level groups)
- `group_identifier` - Group name (e.g., "Group 1", "Group A")
- `assigned_by` - Who assigned the group
- `is_active` - Active status
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Assign 30 students to Group 1 for lab sessions
INSERT INTO event.group_assignment (user_id, section_id, group_identifier, assigned_by)
SELECT id, 'section-a-uuid', 'Group 1', 'admin-uuid'
FROM user.account
WHERE id IN ('student1-uuid', 'student2-uuid', ...);
```

---

### 5. event.event_room

Room assignments for events (supports multi-room events).

```sql
CREATE TABLE event.event_room (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES event.event(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES venue.room(id) ON DELETE RESTRICT,
  capacity integer,
  is_primary_room boolean DEFAULT false,
  room_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_event_room UNIQUE(event_id, room_id)
);

CREATE INDEX idx_event_room_event ON event.event_room(event_id);
CREATE INDEX idx_event_room_room ON event.event_room(room_id);

CREATE TRIGGER set_event_event_room_updated_at
BEFORE UPDATE ON event.event_room
FOR EACH ROW
EXECUTE PROCEDURE event.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `event_id` - Links to event
- `room_id` - Links to venue.room
- `capacity` - Room capacity for this event
- `is_primary_room` - Main room indicator
- `room_notes` - Special instructions
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Exam in 3 rooms
INSERT INTO event.event_room (event_id, room_id, capacity, is_primary_room) VALUES
('exam-uuid', 'room-101-uuid', 50, true),
('exam-uuid', 'room-102-uuid', 50, false),
('exam-uuid', 'room-103-uuid', 50, false);
```

---

### 6. event.event_instructor

Instructor assignments per room (supports multi-instructor).

```sql
CREATE TABLE event.event_instructor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_room_id uuid NOT NULL REFERENCES event.event_room(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES user.account(id) ON DELETE RESTRICT,
  role text DEFAULT 'instructor' CHECK(role IN (
    'instructor', 'co_instructor', 'lab_supervisor', 'invigilator',
    'guest_lecturer', 'teaching_assistant', 'observer'
  )),
  is_primary boolean DEFAULT false,
  responsibility_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_event_instructor UNIQUE(event_room_id, instructor_id)
);

CREATE INDEX idx_event_instructor_room ON event.event_instructor(event_room_id);
CREATE INDEX idx_event_instructor_user ON event.event_instructor(instructor_id);

CREATE TRIGGER set_event_event_instructor_updated_at
BEFORE UPDATE ON event.event_instructor
FOR EACH ROW
EXECUTE PROCEDURE event.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `event_room_id` - Links to event_room
- `instructor_id` - Links to user.account
- `role` - instructor, co_instructor, lab_supervisor, invigilator, guest_lecturer, teaching_assistant, observer
- `is_primary` - Primary instructor for this room
- `responsibility_notes` - Additional notes
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Assign invigilators to exam rooms
INSERT INTO event.event_instructor (event_room_id, instructor_id, role) VALUES
('room-101-event-uuid', 'teacher-1-uuid', 'invigilator'),
('room-102-event-uuid', 'teacher-2-uuid', 'invigilator'),
('room-103-event-uuid', 'teacher-3-uuid', 'invigilator');
```

---

### 7. event.event_participant

Individual participant tracking (USE ONLY for exams/seat assignments).

```sql
CREATE TABLE event.event_participant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES event.event(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user.account(id) ON DELETE CASCADE,
  event_room_id uuid REFERENCES event.event_room(id) ON DELETE SET NULL,
  seat_number text,
  attendance_status text DEFAULT 'pending' CHECK(attendance_status IN (
    'pending', 'present', 'absent', 'late', 'excused'
  )),
  checked_in_at timestamptz,
  special_requirements text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_event_participant UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_participant_event ON event.event_participant(event_id);
CREATE INDEX idx_event_participant_user ON event.event_participant(user_id);
CREATE INDEX idx_event_participant_room ON event.event_participant(event_room_id);
CREATE INDEX idx_event_participant_attendance ON event.event_participant(event_id, attendance_status);

CREATE TRIGGER set_event_event_participant_updated_at
BEFORE UPDATE ON event.event_participant
FOR EACH ROW
EXECUTE PROCEDURE event.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `event_id` - Links to event
- `user_id` - Student user ID
- `event_room_id` - Assigned room
- `seat_number` - Seat assignment (e.g., "A23")
- `attendance_status` - pending, present, absent, late, excused
- `checked_in_at` - Check-in timestamp
- `special_requirements` - Accessibility needs
- `notes` - Additional notes
- `created_at`, `updated_at` - Timestamps

**When to use:**

- ✅ Exams (seat assignments, room distribution)
- ✅ Workshops with registration/capacity limits
- ❌ Regular lectures (use event_target instead)

**Example:**

```sql
-- Bulk insert exam participants with seat assignments
INSERT INTO event.event_participant (event_id, user_id, event_room_id, seat_number)
VALUES
('exam-uuid', 'student-1-uuid', 'room-101-event-uuid', 'A01'),
('exam-uuid', 'student-2-uuid', 'room-101-event-uuid', 'A02'),
('exam-uuid', 'student-3-uuid', 'room-102-event-uuid', 'B01');
```

---

### 8. event.event_attendance

Attendance tracking for regular lectures (without participant records).

```sql
CREATE TABLE event.event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES event.event(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user.account(id) ON DELETE CASCADE,
  status text NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
  marked_at timestamptz NOT NULL DEFAULT now(),
  marked_by uuid NOT NULL REFERENCES user.account(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_event_attendance UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_attendance_event ON event.event_attendance(event_id);
CREATE INDEX idx_event_attendance_user ON event.event_attendance(user_id);
CREATE INDEX idx_event_attendance_status ON event.event_attendance(event_id, status);

CREATE TRIGGER set_event_event_attendance_updated_at
BEFORE UPDATE ON event.event_attendance
FOR EACH ROW
EXECUTE PROCEDURE event.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `event_id` - Links to event
- `user_id` - Student user ID
- `status` - present, absent, late, excused
- `marked_at` - When attendance was marked
- `marked_by` - Teacher who marked
- `notes` - Additional notes
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Teacher marks attendance for lecture
INSERT INTO event.event_attendance (event_id, user_id, status, marked_by) VALUES
('lecture-uuid', 'student-1-uuid', 'present', 'teacher-uuid'),
('lecture-uuid', 'student-2-uuid', 'present', 'teacher-uuid'),
('lecture-uuid', 'student-3-uuid', 'late', 'teacher-uuid'),
('lecture-uuid', 'student-4-uuid', 'absent', 'teacher-uuid');
```

---

### 9. event.event_change

Audit trail for all event modifications.

```sql
CREATE TABLE event.event_change (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES event.event(id) ON DELETE CASCADE,
  changed_by uuid NOT NULL REFERENCES user.account(id),
  change_type text NOT NULL CHECK(change_type IN (
    'room_change', 'time_change', 'instructor_change',
    'date_change', 'status_change', 'details_change'
  )),
  old_value jsonb NOT NULL,
  new_value jsonb NOT NULL,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  notification_sent boolean DEFAULT false,
  notification_sent_at timestamptz
);

CREATE INDEX idx_event_change_event ON event.event_change(event_id);
CREATE INDEX idx_event_change_type ON event.event_change(change_type);
CREATE INDEX idx_event_change_date ON event.event_change(changed_at);
CREATE INDEX idx_event_change_notification ON event.event_change(notification_sent)
  WHERE notification_sent = false;
```

**Columns:**

- `id` - Primary key
- `event_id` - Links to event
- `changed_by` - User who made change
- `change_type` - room_change, time_change, instructor_change, date_change, status_change, details_change
- `old_value` - Previous state (JSON)
- `new_value` - New state (JSON)
- `reason` - Reason for change
- `changed_at` - When changed
- `notification_sent` - Notification sent flag
- `notification_sent_at` - When notification was sent

**Example:**

```sql
-- Log room change
INSERT INTO event.event_change (event_id, changed_by, change_type, old_value, new_value, reason)
VALUES (
  'event-uuid',
  'admin-uuid',
  'room_change',
  '{"room_id": "room-201-uuid", "room_name": "Room 201"}'::jsonb,
  '{"room_id": "room-305-uuid", "room_name": "Room 305"}'::jsonb,
  'AC not working in Room 201'
);
```

---

### 10. event.event_cancellation

Cancellation records with rescheduling links.

```sql
CREATE TABLE event.event_cancellation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES event.event(id) ON DELETE CASCADE,
  cancelled_by uuid NOT NULL REFERENCES user.account(id),
  reason text NOT NULL,
  cancelled_at timestamptz NOT NULL DEFAULT now(),
  rescheduled_event_id uuid REFERENCES event.event(id) ON DELETE SET NULL,
  notification_sent boolean DEFAULT false,
  notification_sent_at timestamptz,
  CONSTRAINT unique_event_cancellation UNIQUE(event_id)
);

CREATE INDEX idx_event_cancellation_event ON event.event_cancellation(event_id);
CREATE INDEX idx_event_cancellation_rescheduled ON event.event_cancellation(rescheduled_event_id);
CREATE INDEX idx_event_cancellation_notification ON event.event_cancellation(notification_sent)
  WHERE notification_sent = false;
```

**Columns:**

- `id` - Primary key
- `event_id` - Links to cancelled event
- `cancelled_by` - User who cancelled
- `reason` - Cancellation reason
- `cancelled_at` - When cancelled
- `rescheduled_event_id` - Links to new event if rescheduled
- `notification_sent` - Notification sent flag
- `notification_sent_at` - When notification was sent

**Example:**

```sql
-- Cancel event with reschedule
INSERT INTO event.event_cancellation (event_id, cancelled_by, reason, rescheduled_event_id)
VALUES (
  'original-event-uuid',
  'teacher-uuid',
  'Instructor unavailable due to illness',
  'makeup-event-uuid'
);
```

---

### 11. event.routine_exception

Skip dates for recurring routines (holidays).

```sql
CREATE TABLE event.routine_exception (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL REFERENCES event.routine(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  reason text NOT NULL,
  created_by uuid REFERENCES user.account(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_routine_exception UNIQUE(routine_id, exception_date)
);

CREATE INDEX idx_routine_exception_routine ON event.routine_exception(routine_id);
CREATE INDEX idx_routine_exception_date ON event.routine_exception(exception_date);
```

**Columns:**

- `id` - Primary key
- `routine_id` - Links to routine
- `exception_date` - Date to skip
- `reason` - Reason (e.g., "National Holiday")
- `created_by` - User who created
- `created_at` - Timestamp

**Example:**

```sql
-- Skip Monday routine on Feb 21 (holiday)
INSERT INTO event.routine_exception (routine_id, exception_date, reason, created_by)
VALUES (
  'monday-routine-uuid',
  '2025-02-21',
  'National Holiday - International Mother Language Day',
  'admin-uuid'
);
```

---

### 12. event.event_attachment

Documents and resources attached to events.

```sql
CREATE TABLE event.event_attachment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES event.event(id) ON DELETE CASCADE,
  attachment_type text NOT NULL CHECK(attachment_type IN (
    'document', 'link', 'image', 'video', 'other'
  )),
  title text NOT NULL,
  url text NOT NULL,
  file_size integer,
  mime_type text,
  description text,
  uploaded_by uuid REFERENCES user.account(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_attachment_event ON event.event_attachment(event_id);
```

**Columns:**

- `id` - Primary key
- `event_id` - Links to event
- `attachment_type` - document, link, image, video, other
- `title` - Attachment title
- `url` - File URL or external link
- `file_size` - Size in bytes
- `mime_type` - MIME type
- `description` - Description
- `uploaded_by` - User who uploaded
- `created_at` - Timestamp

**Example:**

```sql
-- Attach exam syllabus
INSERT INTO event.event_attachment (event_id, attachment_type, title, url, uploaded_by)
VALUES (
  'exam-uuid',
  'document',
  'Midterm Exam Syllabus',
  'https://storage.example.com/syllabus.pdf',
  'teacher-uuid'
);
```

---

### 13. event.user_events (Materialized View)

Resolves all events visible to a user (optimized query).

```sql
CREATE MATERIALIZED VIEW event.user_events AS
SELECT DISTINCT
  e.id as event_id,
  COALESCE(ep.user_id, ue.user_id, up.user_id) as user_id,
  e.event_type,
  e.title,
  e.description,
  e.course_offering_id,
  e.date,
  e.start_time,
  e.end_time,
  e.duration_minutes,
  e.status,
  e.priority,
  e.is_recurring,
  ep.seat_number,
  ep.event_room_id as assigned_room_id,
  ep.attendance_status,
  et.target_type,
  et.target_id,
  et.group_identifier
FROM event.event e
LEFT JOIN event.event_participant ep ON e.id = ep.event_id
LEFT JOIN event.event_target et ON e.id = et.event_id
LEFT JOIN academic.user_enrollment ue ON (
  et.target_type = 'course_offering'
  AND et.target_id = ue.course_offering_id
  AND ue.status = 'ENROLLED'
)
LEFT JOIN user.profile up ON (
  (et.target_type = 'batch' AND et.target_id = up.batch_id) OR
  (et.target_type = 'section' AND et.target_id = up.section_id) OR
  (et.target_type = 'department' AND et.target_id = up.department_id)
)
LEFT JOIN event.group_assignment ga ON (
  et.group_identifier IS NOT NULL
  AND ga.user_id = up.user_id
  AND ga.group_identifier = et.group_identifier
  AND ga.is_active = true
  AND (
    (et.target_type = 'section' AND ga.section_id = et.target_id) OR
    (et.target_type = 'course_offering' AND ga.course_offering_id = et.target_id)
  )
)
WHERE COALESCE(ep.user_id, ue.user_id, up.user_id) IS NOT NULL;

CREATE UNIQUE INDEX idx_user_events_unique ON event.user_events(event_id, user_id);
CREATE INDEX idx_user_events_user_date ON event.user_events(user_id, date);
CREATE INDEX idx_user_events_user_status ON event.user_events(user_id, status);
```

**Refresh Strategy:**

```sql
-- Refresh after event changes
REFRESH MATERIALIZED VIEW CONCURRENTLY event.user_events;
```

---

## Notification Schema

### 14. notification.notification

Main notification records.

```sql
CREATE SCHEMA IF NOT EXISTS notification;

CREATE TABLE notification.notification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  notification_type text NOT NULL CHECK(notification_type IN (
    'schedule_reminder', 'schedule_change', 'cancellation',
    'exam_alert', 'seminar_announcement', 'general'
  )),
  priority text NOT NULL CHECK(priority IN ('urgent', 'normal', 'low')),
  event_id uuid REFERENCES event.event(id) ON DELETE CASCADE,
  event_change_id uuid REFERENCES event.event_change(id) ON DELETE CASCADE,
  event_cancellation_id uuid REFERENCES event.event_cancellation(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK(target_type IN (
    'batch', 'section', 'course_offering', 'department', 'custom'
  )),
  target_id uuid NOT NULL,
  channels jsonb NOT NULL DEFAULT '["push"]'::jsonb,
  scheduled_for timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN (
    'pending', 'processing', 'sent', 'failed', 'cancelled'
  )),
  created_by uuid NOT NULL REFERENCES user.account(id),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_event ON notification.notification(event_id);
CREATE INDEX idx_notification_status ON notification.notification(status);
CREATE INDEX idx_notification_target ON notification.notification(target_type, target_id);
CREATE INDEX idx_notification_scheduled ON notification.notification(scheduled_for)
  WHERE scheduled_for IS NOT NULL AND status = 'pending';

CREATE OR REPLACE FUNCTION notification.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_notification_notification_updated_at
BEFORE UPDATE ON notification.notification
FOR EACH ROW
EXECUTE PROCEDURE notification.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `title` - Notification title
- `message` - Notification body
- `notification_type` - schedule_reminder, schedule_change, cancellation, exam_alert, seminar_announcement, general
- `priority` - urgent (SMS+Push), normal (Push), low (Push)
- `event_id` - Links to event
- `event_change_id` - Links to event change
- `event_cancellation_id` - Links to cancellation
- `target_type` - batch, section, course_offering, department, custom
- `target_id` - Target UUID
- `channels` - JSON array: ["sms", "push"]
- `scheduled_for` - Schedule for later (nullable = immediate)
- `status` - pending, processing, sent, failed, cancelled
- `created_by` - User who created
- `metadata` - Additional JSON data
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Create room change notification
INSERT INTO notification.notification (
  title, message, notification_type, priority, event_id, event_change_id,
  target_type, target_id, channels, created_by
) VALUES (
  'Room Change: CSE 301 Lecture',
  'Your lecture has been moved from Room 201 to Room 305 due to AC maintenance.',
  'schedule_change',
  'normal',
  'event-uuid',
  'change-uuid',
  'course_offering',
  'course-uuid',
  '["push"]'::jsonb,
  'system-uuid'
);
```

---

### 15. notification.notification_recipient

Individual delivery tracking per user.

```sql
CREATE TABLE notification.notification_recipient (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES notification.notification(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user.account(id) ON DELETE CASCADE,
  channels_sent jsonb DEFAULT '{}'::jsonb,
  sms_status text CHECK(sms_status IN ('pending', 'sent', 'delivered', 'failed', 'skipped')),
  push_status text CHECK(push_status IN ('pending', 'sent', 'delivered', 'failed', 'not_registered', 'skipped')),
  sms_sent_at timestamptz,
  push_sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_notification_recipient UNIQUE(notification_id, user_id)
);

CREATE INDEX idx_notification_recipient_notification ON notification.notification_recipient(notification_id);
CREATE INDEX idx_notification_recipient_user ON notification.notification_recipient(user_id);
CREATE INDEX idx_notification_recipient_unread ON notification.notification_recipient(user_id, read_at)
  WHERE read_at IS NULL;

CREATE TRIGGER set_notification_recipient_updated_at
BEFORE UPDATE ON notification.notification_recipient
FOR EACH ROW
EXECUTE PROCEDURE notification.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `notification_id` - Links to notification
- `user_id` - Recipient user ID
- `channels_sent` - JSON: {"sms": "sent", "push": "delivered"}
- `sms_status` - pending, sent, delivered, failed, skipped
- `push_status` - pending, sent, delivered, failed, not_registered, skipped
- `sms_sent_at` - SMS sent timestamp
- `push_sent_at` - Push sent timestamp
- `read_at` - When user read notification
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Create recipient records for all enrolled students
INSERT INTO notification.notification_recipient (notification_id, user_id, push_status)
SELECT
  'notification-uuid',
  ue.user_id,
  'pending'
FROM academic.user_enrollment ue
WHERE ue.course_offering_id = 'course-uuid' AND ue.status = 'ENROLLED';
```

---

### 16. notification.device_token

Push notification device registration.

```sql
CREATE TABLE notification.device_token (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user.account(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text NOT NULL CHECK(platform IN ('ios', 'android', 'web')),
  device_info jsonb,
  is_active boolean DEFAULT true,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_token_user ON notification.device_token(user_id);
CREATE INDEX idx_device_token_active ON notification.device_token(user_id, is_active)
  WHERE is_active = true;
CREATE INDEX idx_device_token_token ON notification.device_token(token);

CREATE TRIGGER set_notification_device_token_updated_at
BEFORE UPDATE ON notification.device_token
FOR EACH ROW
EXECUTE PROCEDURE notification.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `user_id` - User ID
- `token` - FCM/APNS token (unique)
- `platform` - ios, android, web
- `device_info` - JSON device metadata
- `is_active` - Active status
- `last_used_at` - Last used timestamp
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Register device token
INSERT INTO notification.device_token (user_id, token, platform, device_info)
VALUES (
  'user-uuid',
  'fcm-token-xyz123',
  'android',
  '{"model": "Samsung Galaxy S21", "os_version": "Android 12"}'::jsonb
);
```

---

### 17. notification.notification_template

Reusable notification templates.

```sql
CREATE TABLE notification.notification_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  notification_type text NOT NULL,
  priority text NOT NULL,
  title_template text NOT NULL,
  message_template text NOT NULL,
  channels jsonb DEFAULT '["push"]'::jsonb,
  variables jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_template_type ON notification.notification_template(notification_type);
CREATE INDEX idx_notification_template_active ON notification.notification_template(is_active)
  WHERE is_active = true;

CREATE TRIGGER set_notification_template_updated_at
BEFORE UPDATE ON notification.notification_template
FOR EACH ROW
EXECUTE PROCEDURE notification.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `name` - Template name (unique)
- `notification_type` - Type of notification
- `priority` - urgent, normal, low
- `title_template` - Title with placeholders
- `message_template` - Message with placeholders
- `channels` - JSON array of channels
- `variables` - JSON array of variable names
- `is_active` - Active status
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Create template for room change
INSERT INTO notification.notification_template (
  name, notification_type, priority, title_template, message_template, channels, variables
) VALUES (
  'exam_room_change',
  'schedule_change',
  'urgent',
  'Room Change: {{event_title}}',
  'Your exam venue has been changed from {{old_room}} to {{new_room}}. Date: {{date}}, Time: {{time}}',
  '["sms", "push"]'::jsonb,
  '["event_title", "old_room", "new_room", "date", "time"]'::jsonb
);
```

---

### 18. notification.user_preference

User notification preferences (opt-in/opt-out).

```sql
CREATE TABLE notification.user_preference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user.account(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  notification_type text NOT NULL,
  channel text NOT NULL CHECK(channel IN ('sms', 'push')),
  enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_preference UNIQUE(user_id, event_type, notification_type, channel)
);

CREATE INDEX idx_user_preference_user ON notification.user_preference(user_id);

CREATE TRIGGER set_notification_user_preference_updated_at
BEFORE UPDATE ON notification.user_preference
FOR EACH ROW
EXECUTE PROCEDURE notification.set_current_timestamp_updated_at();
```

**Columns:**

- `id` - Primary key
- `user_id` - User ID
- `event_type` - Event type (lecture, exam, etc.)
- `notification_type` - Notification type (change, cancellation, reminder)
- `channel` - sms, push
- `enabled` - Enabled status
- `created_at`, `updated_at` - Timestamps

**Example:**

```sql
-- Student disables SMS for lecture changes
INSERT INTO notification.user_preference (user_id, event_type, notification_type, channel, enabled)
VALUES ('user-uuid', 'lecture', 'schedule_change', 'sms', false);
```

---

## Complete Event Examples by Type

### Example 1: Regular Lecture (Weekly Routine)

**Scenario:** CSE 301 Monday 10:00-11:00 AM lecture for entire course offering.

```sql
-- 1. Create routine
INSERT INTO event.routine (name, course_offering_id, day_of_week, start_time, end_time, effective_from, created_by)
VALUES ('CSE 301 Monday Lecture', 'course-offering-uuid', 1, '10:00', '11:00', '2025-01-06', 'admin-uuid')
RETURNING id as routine_id; -- routine_id = 'routine-uuid'

-- 2. Create generated event for specific Monday
INSERT INTO event.event (event_type, title, course_offering_id, date, start_time, end_time, priority, is_recurring, routine_id, created_by)
VALUES ('lecture', 'CSE 301 - Data Structures', 'course-offering-uuid', '2025-01-20', '10:00', '11:00', 'normal', true, 'routine-uuid', 'admin-uuid')
RETURNING id as event_id; -- event_id = 'lecture-event-uuid'

-- 3. Target entire course offering
INSERT INTO event.event_target (event_id, target_type, target_id)
VALUES ('lecture-event-uuid', 'course_offering', 'course-offering-uuid');

-- 4. Assign room
INSERT INTO event.event_room (event_id, room_id, is_primary_room)
VALUES ('lecture-event-uuid', 'room-201-uuid', true);

-- 5. Assign instructor
INSERT INTO event.event_instructor (event_room_id, instructor_id, role, is_primary)
VALUES ('lecture-room-uuid', 'teacher-1-uuid', 'instructor', true);

-- NOTE: No event_participant needed - all enrolled students see it via event_target
```

**Result:** All students enrolled in CSE 301 see this lecture in their schedule.

---

### Example 2: Exam with Seat Assignments

**Scenario:** Midterm exam on Feb 15, 2:00-4:00 PM, 150 students across 3 rooms with assigned seats.

```sql
-- 1. Create exam event
INSERT INTO event.event (event_type, title, course_offering_id, date, start_time, end_time, priority, created_by)
VALUES ('exam', 'CSE 301 Midterm Exam', 'course-offering-uuid', '2025-02-15', '14:00', '16:00', 'urgent', 'admin-uuid')
RETURNING id as event_id; -- event_id = 'exam-event-uuid'

-- 2. Target all enrolled students
INSERT INTO event.event_target (event_id, target_type, target_id)
VALUES ('exam-event-uuid', 'course_offering', 'course-offering-uuid');

-- 3. Assign 3 rooms
INSERT INTO event.event_room (event_id, room_id, capacity, is_primary_room) VALUES
('exam-event-uuid', 'room-101-uuid', 50, true),
('exam-event-uuid', 'room-102-uuid', 50, false),
('exam-event-uuid', 'room-103-uuid', 50, false)
RETURNING id, room_id; -- Get IDs: room-101-event-uuid, room-102-event-uuid, room-103-event-uuid

-- 4. Assign invigilators
INSERT INTO event.event_instructor (event_room_id, instructor_id, role) VALUES
('room-101-event-uuid', 'teacher-1-uuid', 'invigilator'),
('room-102-event-uuid', 'teacher-2-uuid', 'invigilator'),
('room-103-event-uuid', 'teacher-3-uuid', 'invigilator');

-- 5. Assign participants with seats (use Hasura Action: generateEventParticipants)
-- Or manually for demonstration:
INSERT INTO event.event_participant (event_id, user_id, event_room_id, seat_number) VALUES
('exam-event-uuid', 'student-1-uuid', 'room-101-event-uuid', 'A01'),
('exam-event-uuid', 'student-2-uuid', 'room-101-event-uuid', 'A02'),
('exam-event-uuid', 'student-3-uuid', 'room-102-event-uuid', 'B01'),
('exam-event-uuid', 'student-4-uuid', 'room-103-event-uuid', 'C01');

-- 6. Attach syllabus
INSERT INTO event.event_attachment (event_id, attachment_type, title, url, uploaded_by)
VALUES ('exam-event-uuid', 'document', 'Midterm Syllabus', 'https://storage.example.com/syllabus.pdf', 'teacher-1-uuid');
```

**Result:** Each student sees their assigned room and seat number.

---

### Example 3: Lab Session with Groups

**Scenario:** CSE 301 Lab on Wednesdays, section split into Group 1 and Group 2, different times.

```sql
-- 1. Create routine for Group 1 (9:00-11:00 AM)
INSERT INTO event.routine (name, course_offering_id, day_of_week, start_time, end_time, effective_from, event_type, created_by)
VALUES ('CSE 301 Lab Group 1', 'course-offering-uuid', 3, '09:00', '11:00', '2025-01-08', 'practical', 'admin-uuid')
RETURNING id as routine_1_id; -- routine_1_id = 'routine-1-uuid'

-- 2. Create routine for Group 2 (2:00-4:00 PM)
INSERT INTO event.routine (name, course_offering_id, day_of_week, start_time, end_time, effective_from, event_type, created_by)
VALUES ('CSE 301 Lab Group 2', 'course-offering-uuid', 3, '14:00', '16:00', '2025-01-08', 'practical', 'admin-uuid')
RETURNING id as routine_2_id; -- routine_2_id = 'routine-2-uuid'

-- 3. Assign students to groups
INSERT INTO event.group_assignment (user_id, section_id, group_identifier, assigned_by) VALUES
('student-1-uuid', 'section-a-uuid', 'Group 1', 'admin-uuid'),
('student-2-uuid', 'section-a-uuid', 'Group 1', 'admin-uuid'),
('student-3-uuid', 'section-a-uuid', 'Group 2', 'admin-uuid'),
('student-4-uuid', 'section-a-uuid', 'Group 2', 'admin-uuid');

-- 4. Create event for Group 1 (Jan 22)
INSERT INTO event.event (event_type, title, course_offering_id, date, start_time, end_time, priority, is_recurring, routine_id, created_by)
VALUES ('practical', 'CSE 301 Lab', 'course-offering-uuid', '2025-01-22', '09:00', '11:00', 'normal', true, 'routine-1-uuid', 'admin-uuid')
RETURNING id as event_1_id; -- event_1_id = 'lab-1-event-uuid'

-- 5. Create event for Group 2 (Jan 22)
INSERT INTO event.event (event_type, title, course_offering_id, date, start_time, end_time, priority, is_recurring, routine_id, created_by)
VALUES ('practical', 'CSE 301 Lab', 'course-offering-uuid', '2025-01-22', '14:00', '16:00', 'normal', true, 'routine-2-uuid', 'admin-uuid')
RETURNING id as event_2_id; -- event_2_id = 'lab-2-event-uuid'

-- 6. Target Group 1
INSERT INTO event.event_target (event_id, target_type, target_id, group_identifier)
VALUES ('lab-1-event-uuid', 'section', 'section-a-uuid', 'Group 1');

-- 7. Target Group 2
INSERT INTO event.event_target (event_id, target_type, target_id, group_identifier)
VALUES ('lab-2-event-uuid', 'section', 'section-a-uuid', 'Group 2');

-- 8. Assign rooms and instructors for Group 1
INSERT INTO event.event_room (event_id, room_id, is_primary_room)
VALUES ('lab-1-event-uuid', 'lab-101-uuid', true);
INSERT INTO event.event_instructor (event_room_id, instructor_id, role, is_primary)
SELECT id, 'lab-supervisor-uuid', 'lab_supervisor', true
FROM event.event_room WHERE event_id = 'lab-1-event-uuid';

-- 9. Assign rooms and instructors for Group 2
INSERT INTO event.event_room (event_id, room_id, is_primary_room)
VALUES ('lab-2-event-uuid', 'lab-101-uuid', true);
INSERT INTO event.event_instructor (event_room_id, instructor_id, role, is_primary)
SELECT id, 'lab-supervisor-uuid', 'lab_supervisor', true
FROM event.event_room WHERE event_id = 'lab-2-event-uuid';
```

**Result:** Only Group 1 students see 9:00 AM lab; only Group 2 students see 2:00 PM lab.

---

### Example 4: Tutorial Session

**Scenario:** Weekly tutorial for specific section, optional attendance.

```sql
-- 1. Create routine
INSERT INTO event.routine (name, course_offering_id, day_of_week, start_time, end_time, effective_from, event_type, created_by)
VALUES ('CSE 301 Tutorial Section A', 'course-offering-uuid', 2, '15:00', '16:00', '2025-01-07', 'tutorial', 'admin-uuid')
RETURNING id as routine_id; -- routine_id = 'tutorial-routine-uuid'

-- 2. Create event
INSERT INTO event.event (event_type, title, course_offering_id, date, start_time, end_time, priority, is_recurring, routine_id, created_by)
VALUES ('tutorial', 'CSE 301 Tutorial - Data Structures', 'course-offering-uuid', '2025-01-21', '15:00', '16:00', 'normal', true, 'tutorial-routine-uuid', 'admin-uuid')
RETURNING id as event_id; -- event_id = 'tutorial-event-uuid'

-- 3. Target specific section
INSERT INTO event.event_target (event_id, target_type, target_id)
VALUES ('tutorial-event-uuid', 'section', 'section-a-uuid');

-- 4. Assign room and instructor
INSERT INTO event.event_room (event_id, room_id, is_primary_room)
VALUES ('tutorial-event-uuid', 'tutorial-room-uuid', true);
INSERT INTO event.event_instructor (event_room_id, instructor_id, role, is_primary)
SELECT id, 'ta-uuid', 'teaching_assistant', true
FROM event.event_room WHERE event_id = 'tutorial-event-uuid';
```

**Result:** All students in Section A see this tutorial.

---

### Example 5: Workshop/Extra Session

**Scenario:** One-time workshop on Blockchain, open to multiple batches.

```sql
-- 1. Create event
INSERT INTO event.event (event_type, title, date, start_time, end_time, priority, created_by, description)
VALUES ('workshop', 'Introduction to Blockchain Technology', '2025-03-10', '14:00', '17:00', 'low', 'admin-uuid', 'Hands-on workshop covering blockchain basics, smart contracts, and decentralized applications.')
RETURNING id as event_id; -- event_id = 'workshop-event-uuid'

-- 2. Target multiple batches
INSERT INTO event.event_target (event_id, target_type, target_id) VALUES
('workshop-event-uuid', 'batch', 'batch-2022-uuid'),
('workshop-event-uuid', 'batch', 'batch-2023-uuid');

-- 3. Assign auditorium
INSERT INTO event.event_room (event_id, room_id, is_primary_room, capacity)
VALUES ('workshop-event-uuid', 'auditorium-uuid', true, 300);

-- 4. Assign guest speaker and co-organizer
INSERT INTO event.event_instructor (event_room_id, instructor_id, role, is_primary) VALUES
('workshop-room-uuid', 'guest-speaker-uuid', 'guest_lecturer', true),
('workshop-room-uuid', 'organizer-uuid', 'instructor', false);

-- 5. Attach registration form
INSERT INTO event.event_attachment (event_id, attachment_type, title, url, uploaded_by)
VALUES ('workshop-event-uuid', 'link', 'Registration Form', 'https://forms.gle/example', 'organizer-uuid');
```

**Result:** All students from 2022 and 2023 batches see this workshop.

---

### Example 6: Seminar

**Scenario:** Department-wide research seminar.

```sql
-- 1. Create event
INSERT INTO event.event (event_type, title, date, start_time, end_time, priority, created_by, description)
VALUES ('seminar', 'Research Seminar: AI in Healthcare', '2025-02-28', '16:00', '17:30', 'low', 'admin-uuid', 'Guest lecture by Dr. Smith on applications of AI in healthcare.')
RETURNING id as event_id; -- event_id = 'seminar-event-uuid'

-- 2. Target entire department
INSERT INTO event.event_target (event_id, target_type, target_id)
VALUES ('seminar-event-uuid', 'department', 'cse-department-uuid');

-- 3. Assign seminar hall
INSERT INTO event.event_room (event_id, room_id, is_primary_room)
VALUES ('seminar-event-uuid', 'seminar-hall-uuid', true);

-- 4. Assign guest lecturer
INSERT INTO event.event_instructor (event_room_id, instructor_id, role, is_primary)
SELECT id, 'guest-lecturer-uuid', 'guest_lecturer', true
FROM event.event_room WHERE event_id = 'seminar-event-uuid';
```

**Result:** All students in CSE department see this seminar.

---

### Example 7: Meeting

**Scenario:** Student council meeting for specific batch.

```sql
-- 1. Create event
INSERT INTO event.event (event_type, title, date, start_time, end_time, priority, created_by, description)
VALUES ('meeting', 'Student Council Meeting - Batch 2022', '2025-02-01', '18:00', '19:30', 'normal', 'admin-uuid', 'Discussion on upcoming events and initiatives.')
RETURNING id as event_id; -- event_id = 'meeting-event-uuid'

-- 2. Target specific batch
INSERT INTO event.event_target (event_id, target_type, target_id)
VALUES ('meeting-event-uuid', 'batch', 'batch-2022-uuid');

-- 3. Assign room
INSERT INTO event.event_room (event_id, room_id, is_primary_room)
VALUES ('meeting-event-uuid', 'meeting-room-uuid', true);

-- 4. No instructor needed (student-led)
```

**Result:** All students from Batch 2022 see this meeting.

---

### Example 8: Event with Change Log

**Scenario:** Lecture room changed due to AC maintenance.

```sql
-- 1. Original event exists (from Example 1)

-- 2. Log the change
INSERT INTO event.event_change (event_id, changed_by, change_type, old_value, new_value, reason)
VALUES (
  'lecture-event-uuid',
  'admin-uuid',
  'room_change',
  '{"room_id": "room-201-uuid", "room_name": "Room 201"}'::jsonb,
  '{"room_id": "room-305-uuid", "room_name": "Room 305"}'::jsonb,
  'AC maintenance in Room 201'
)
RETURNING id as change_id; -- change_id = 'change-uuid'

-- 3. Update the room
DELETE FROM event.event_room WHERE event_id = 'lecture-event-uuid';
INSERT INTO event.event_room (event_id, room_id, is_primary_room)
VALUES ('lecture-event-uuid', 'room-305-uuid', true);

-- 4. Trigger notification (automatic via webhook or manual)
INSERT INTO notification.notification (
  title, message, notification_type, priority, event_id, event_change_id,
  target_type, target_id, channels, created_by
) VALUES (
  'Room Change: CSE 301 Lecture',
  'Your lecture has been moved from Room 201 to Room 305 due to AC maintenance.',
  'schedule_change',
  'normal',
  'lecture-event-uuid',
  'change-uuid',
  'course_offering',
  'course-offering-uuid',
  '["push"]'::jsonb,
  'system-uuid'
);
```

**Result:** All students notified, event updated, change logged.

---

### Example 9: Cancellation with Reschedule

**Scenario:** Exam cancelled due to instructor illness, rescheduled 2 days later.

```sql
-- 1. Original exam exists (from Example 2)

-- 2. Cancel the exam
INSERT INTO event.event_cancellation (event_id, cancelled_by, reason)
VALUES ('exam-event-uuid', 'admin-uuid', 'Instructor unavailable due to illness')
RETURNING id as cancellation_id; -- cancellation_id = 'cancellation-uuid'

-- 3. Update event status
UPDATE event.event SET status = 'cancelled' WHERE id = 'exam-event-uuid';

-- 4. Create rescheduled exam
INSERT INTO event.event (event_type, title, course_offering_id, date, start_time, end_time, priority, created_by)
VALUES ('exam', 'CSE 301 Midterm Exam (Rescheduled)', 'course-offering-uuid', '2025-02-17', '14:00', '16:00', 'urgent', 'admin-uuid')
RETURNING id as new_event_id; -- new_event_id = 'rescheduled-exam-uuid'

-- 5. Link cancellation to rescheduled event
UPDATE event.event_cancellation
SET rescheduled_event_id = 'rescheduled-exam-uuid'
WHERE id = 'cancellation-uuid';

-- 6. Copy all configurations to rescheduled exam
INSERT INTO event.event_target (event_id, target_type, target_id)
SELECT 'rescheduled-exam-uuid', target_type, target_id
FROM event.event_target WHERE event_id = 'exam-event-uuid';

INSERT INTO event.event_room (event_id, room_id, capacity, is_primary_room)
SELECT 'rescheduled-exam-uuid', room_id, capacity, is_primary_room
FROM event.event_room WHERE event_id = 'exam-event-uuid';

-- 7. Trigger notification
INSERT INTO notification.notification (
  title, message, notification_type, priority, event_id, event_cancellation_id,
  target_type, target_id, channels, created_by
) VALUES (
  'Exam Cancelled and Rescheduled',
  'CSE 301 Midterm Exam has been rescheduled from Feb 15 to Feb 17 (same time).',
  'cancellation',
  'urgent',
  'rescheduled-exam-uuid',
  'cancellation-uuid',
  'course_offering',
  'course-offering-uuid',
  '["sms", "push"]'::jsonb,
  'system-uuid'
);
```

**Result:** Exam cancelled, rescheduled, and all students notified via SMS + Push.

---

## Migration Order

1. `CREATE SCHEMA event;`
2. `CREATE SCHEMA notification;`
3. Create trigger function `event.set_current_timestamp_updated_at()`
4. Create trigger function `notification.set_current_timestamp_updated_at()`
5. `event.routine`
6. `event.event`
7. `event.event_target`
8. `event.group_assignment`
9. `event.event_room`
10. `event.event_instructor`
11. `event.event_participant`
12. `event.event_attendance`
13. `event.event_change`
14. `event.event_cancellation`
15. `event.routine_exception`
16. `event.event_attachment`
17. `notification.notification`
18. `notification.notification_recipient`
19. `notification.device_token`
20. `notification.notification_template`
21. `notification.user_preference`
22. `event.user_events` (materialized view)

---

## Summary

**Total Tables:** 18 (13 event + 5 notification)

**Key Features:**

- Group-based targeting (avoid individual records for lectures)
- Selective individual tracking (exams only)
- Sub-section groups (lab splits)
- Complete audit trail (all changes tracked)
- Multi-channel notifications (SMS + Push)
- Venue integration (links to existing venue schema)
- Attendance tracking (separate for lectures/exams)
- Routine exceptions (holidays)
- Notification preferences (user control)

**Ready for Hasura migration creation!**
