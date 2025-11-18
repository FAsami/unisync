# Event Management System

## Overview

The Event Management System provides comprehensive scheduling for academic events including lectures, exams, practicals, seminars, and workshops. It supports both one-time and recurring events with flexible targeting, room assignments, and participant management.

## Key Features

### Event Types

- **Lectures** - Regular recurring classes
- **Exams** - Exams with seat assignments and room distribution
- **Practicals/Labs** - Laboratory sessions
- **Tutorials** - Small group tutorials
- **Seminars** - Guest lectures and special events
- **Workshops** - Hands-on workshops
- **Meetings** - Administrative meetings
- **Other** - Custom event types

### Targeting System

Events can be targeted to:

- **Course Offerings** - All enrolled students
- **Sections** - Specific section within a batch
- **Batches** - All students in a batch
- **Departments** - All students in a department
- **Custom Groups** - User-defined groups

### Group-Based vs Individual Tracking

#### Group-Based (Lectures, Seminars)

- Events use `event_target` to target students by batch/section/course
- No individual participant records
- Students automatically see events they're enrolled in
- Efficient for large groups

#### Individual Tracking (Exams)

- Events use `event_participant` for specific assignments
- Each student has a record with seat number and room
- Required for exams with seat distribution
- Used for capacity-limited workshops

### Multi-Room Support

- Single event can span multiple rooms (e.g., large exams)
- Each room has its own capacity and instructors
- Room-specific notes and instructions

### Recurring Events

- Define weekly patterns via `routine`
- Auto-generate events for date range
- Handle holidays via `routine_exception`
- Easy maintenance of semester schedules

### Sub-Section Groups

- Split sections into smaller groups (e.g., lab groups)
- Different time slots for different groups
- Automatic filtering based on group assignment

## Core Concepts

### Routine

A recurring pattern that generates events weekly.

```sql
-- Monday 10-11 AM lecture for CSE 301
CREATE routine (
  name: "CSE 301 Monday Lecture",
  day_of_week: 1,  -- Monday
  start_time: "10:00",
  end_time: "11:00",
  course_offering_id: "uuid",
  effective_from: "2025-01-06",
  effective_to: "2025-05-30"
)
```

Events generated: One per Monday from effective_from to effective_to.

### Event Target

Links events to who should see them.

```sql
-- All students in Section A see this event
CREATE event_target (
  event_id: "uuid",
  target_type: "section",
  target_id: "section-a-uuid"
)

-- Only Group 1 students see this event
CREATE event_target (
  event_id: "uuid",
  target_type: "section",
  target_id: "section-a-uuid",
  group_identifier: "Group 1"
)
```

### Participant vs Attendance

**Participant** (`event_participant`):

- Used for exams with seat assignments
- Pre-created before event
- Includes room and seat number
- Limited to specific students

**Attendance** (`event_attendance`):

- Used for regular lectures
- Created when teacher marks attendance
- No pre-creation needed
- All enrolled students eligible

## Common Workflows

### Creating a Weekly Lecture

1. Create routine for the pattern
2. Generate events from routine (via Hasura action)
3. Each generated event automatically gets:
   - Target based on course offering
   - Room assignment
   - Instructor assignment

### Setting Up an Exam

1. Create exam event with urgent priority
2. Assign multiple rooms
3. Assign invigilators to each room
4. Generate participants (via Hasura action):
   - Fetches enrolled students
   - Distributes across rooms
   - Assigns seat numbers
5. Students see their specific room and seat

### Managing Lab Groups

1. Create group assignments for students
2. Create separate routines for each group (different times)
3. Generate events with group_identifier in target
4. Students automatically see only their group's events

### Room Changes

1. Update `event_room` record
2. Log change in `event_change` table
3. Hasura trigger sends notification to all affected students
4. Students receive push notification immediately

### Cancellations

1. Create rescheduled event (if needed)
2. Update original event status to 'cancelled'
3. Create `event_cancellation` record with reason
4. Link to rescheduled event if applicable
5. Hasura trigger sends urgent notification (SMS + Push)
6. Notification includes reschedule details

## Query Patterns

### Student's Daily Schedule

```graphql
query GetStudentDailySchedule($user_id: uuid!, $date: date!) {
  user_events(
    where: {
      user_id: { _eq: $user_id }
      date: { _eq: $date }
      status: { _in: ["scheduled", "ongoing"] }
    }
    order_by: { start_time: asc }
  ) {
    event_id
    title
    event_type
    start_time
    end_time
    seat_number
    event {
      description
      event_rooms {
        room {
          room_name
          floor
          building {
            name
          }
        }
        event_instructors {
          instructor {
            profile {
              first_name
              last_name
            }
          }
          role
        }
      }
    }
  }
}
```

### Room Availability Check

```graphql
query CheckRoomAvailability(
  $room_id: uuid!
  $date: date!
  $start_time: time!
  $end_time: time!
) {
  event_room(
    where: {
      room_id: { _eq: $room_id }
      event: {
        date: { _eq: $date }
        status: { _in: ["scheduled", "ongoing"] }
        _or: [
          { start_time: { _lte: $start_time }, end_time: { _gt: $start_time } }
          { start_time: { _lt: $end_time }, end_time: { _gte: $end_time } }
          { start_time: { _gte: $start_time }, end_time: { _lte: $end_time } }
        ]
      }
    }
  ) {
    event {
      title
      start_time
      end_time
    }
  }
}
```

### Event Changes History

```graphql
query GetEventChanges($event_id: uuid!) {
  event_change(
    where: { event_id: { _eq: $event_id } }
    order_by: { changed_at: desc }
  ) {
    change_type
    old_value
    new_value
    reason
    changed_at
    changed_by_user {
      profile {
        first_name
        last_name
      }
    }
  }
}
```

## Hasura Actions

### generateRoutineEvents

Generate events from a routine for a date range.

```graphql
mutation GenerateRoutineEvents {
  generateRoutineEvents(
    routine_id: "uuid"
    start_date: "2025-01-06"
    end_date: "2025-05-30"
  ) {
    success
    events_created
    event_ids
  }
}
```

**Backend logic:**

- Fetch routine details
- Get exceptions (holidays)
- For each week in date range:
  - Calculate event date (day_of_week)
  - Skip if exception exists
  - Create event
  - Auto-create target
  - Copy room and instructor assignments from routine

### generateEventParticipants

Bulk generate participant records for exams with seat assignments.

```graphql
mutation GenerateExamParticipants {
  generateEventParticipants(
    event_id: "uuid"
    distribution: [
      { room_id: "uuid", seat_prefix: "A", seat_start: 1, seat_end: 50 }
      { room_id: "uuid", seat_prefix: "B", seat_start: 1, seat_end: 50 }
    ]
    sort_by: "roll_number"
  ) {
    success
    participants_created
  }
}
```

**Backend logic:**

- Fetch enrolled students from course offering
- Sort by roll_number
- Distribute evenly across rooms
- Assign sequential seat numbers with prefix
- Bulk insert participant records

### cancelEventWithReschedule

Cancel an event and optionally create a reschedule.

```graphql
mutation CancelEvent {
  cancelEventWithReschedule(
    event_id: "uuid"
    reason: "Instructor unavailable"
    reschedule_date: "2025-01-18"
    reschedule_start_time: "10:00"
    reschedule_end_time: "11:00"
  ) {
    success
    cancelled_event_id
    rescheduled_event_id
  }
}
```

**Backend logic:**

- Update original event status to 'cancelled'
- Create cancellation record
- If reschedule provided:
  - Create new event with details
  - Copy targets, rooms, instructors
  - Link in cancellation record
- Return success

## Permissions

### Student

- **event.event**: SELECT where user is in user_events
- **event.event_participant**: SELECT where user_id = X-Hasura-User-Id, UPDATE attendance_status
- **event.event_attendance**: SELECT where user_id = X-Hasura-User-Id
- **event.event\_\***: SELECT for visible events

### Teacher

- **event.event**: INSERT/SELECT/UPDATE for their courses
- **event.event\_\***: Full CRUD for their events
- **event.event_attendance**: INSERT/UPDATE for their events

### Admin

- Full access to all tables

## Best Practices

1. **Use routines for recurring lectures** - Avoid manual event creation
2. **Group-based for lectures** - Don't create participant records for regular classes
3. **Individual tracking for exams** - Always create participants with seat assignments
4. **Log all changes** - Use event_change for audit trail
5. **Set appropriate priorities** - Exams=urgent, Lectures=normal, Seminars=low
6. **Handle exceptions** - Use routine_exception for holidays
7. **Refresh materialized view** - After bulk changes to events
8. **Target at course level** - When possible, more efficient than batch/section

## Integration with Notifications

Event changes automatically trigger notifications:

- Room changes → Push notification (normal priority)
- Time changes → Push notification (normal priority)
- Cancellations → SMS + Push (urgent priority)
- Exam reminders → Push notification (normal priority, scheduled)

See [Notification System](/architecture/notification-system) documentation for details.
