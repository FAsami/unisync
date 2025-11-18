# Managing Events and Schedules

## Overview

This guide explains how to create and manage events (lectures, exams, seminars) in the Unisync system. It covers common scenarios like setting up weekly lectures, scheduling exams, and handling changes.

## Table of Contents

1. [Creating Weekly Lectures](#creating-weekly-lectures)
2. [Setting Up Exams](#setting-up-exams)
3. [Managing Lab Sessions](#managing-lab-sessions)
4. [Handling Changes and Cancellations](#handling-changes-and-cancellations)

## Creating Weekly Lectures

### Step 1: Create a Routine

A routine defines a weekly pattern for recurring lectures.

```graphql
mutation CreateRoutine {
  insert_event_routine_one(object: {
    name: "CSE 301 Monday Lecture"
    course_offering_id: "course-uuid"
    day_of_week: 1  # 1 = Monday
    start_time: "10:00:00"
    end_time: "11:00:00"
    event_type: lecture
    effective_from: "2025-01-06"
    effective_to: "2025-05-30"
    is_active: true
  }) {
    id
    name
  }
}
```

### Step 2: Generate Events

Automatically create events for the entire semester.

```graphql
mutation GenerateEvents {
  generateRoutineEvents(
    routine_id: "routine-uuid"
    start_date: "2025-01-06"
    end_date: "2025-05-30"
  ) {
    success
    events_created
    event_ids
  }
}
```

### Step 3: Assign Rooms and Instructors

Each generated event needs room and instructor assignments.

```graphql
# Assign room
mutation AssignRoom {
  insert_event_room_one(object: {
    event_id: "event-uuid"
    room_id: "room-201-uuid"
    is_primary_room: true
  }) {
    id
  }
}

# Assign instructor
mutation AssignInstructor {
  insert_event_instructor_one(object: {
    event_room_id: "event-room-uuid"
    instructor_id: "teacher-uuid"
    role: instructor
    is_primary: true
  }) {
    id
  }
}
```

**Result:** All enrolled students will see these lectures in their schedule.

## Setting Up Exams

Exams require seat assignments and room distribution for large groups.

### Step 1: Create Exam Event

```graphql
mutation CreateExam {
  insert_event_one(object: {
    event_type: exam
    title: "CSE 301 Midterm Examination"
    course_offering_id: "course-uuid"
    date: "2025-02-15"
    start_time: "14:00:00"
    end_time: "16:00:00"
    priority: urgent
  }) {
    id
  }
}
```

### Step 2: Assign Multiple Rooms

For exams with many students, use multiple rooms.

```graphql
mutation AssignRooms {
  insert_event_room(
    objects: [
      {event_id: "exam-uuid", room_id: "room-101-uuid", capacity: 50, is_primary_room: true}
      {event_id: "exam-uuid", room_id: "room-102-uuid", capacity: 50, is_primary_room: false}
      {event_id: "exam-uuid", room_id: "room-103-uuid", capacity: 50, is_primary_room: false}
    ]
  ) {
    affected_rows
  }
}
```

### Step 3: Assign Invigilators

Assign one teacher per room.

```graphql
mutation AssignInvigilators {
  insert_event_instructor(
    objects: [
      {event_room_id: "room-101-event-uuid", instructor_id: "teacher-1-uuid", role: invigilator}
      {event_room_id: "room-102-event-uuid", instructor_id: "teacher-2-uuid", role: invigilator}
      {event_room_id: "room-103-event-uuid", instructor_id: "teacher-3-uuid", role: invigilator}
    ]
  ) {
    affected_rows
  }
}
```

### Step 4: Generate Seat Assignments

Automatically create participant records with seat assignments.

```graphql
mutation GenerateSeats {
  generateEventParticipants(
    event_id: "exam-uuid"
    distribution: [
      {room_id: "room-101-uuid", seat_prefix: "A", seat_start: 1, seat_end: 50}
      {room_id: "room-102-uuid", seat_prefix: "B", seat_start: 1, seat_end: 50}
      {room_id: "room-103-uuid", seat_prefix: "C", seat_start: 1, seat_end: 50}
    ]
    sort_by: roll_number
  ) {
    success
    participants_created
  }
}
```

**Result:** Each student receives a specific room and seat assignment (e.g., Room 101, Seat A23).

## Managing Lab Sessions

Lab sessions often split sections into smaller groups with different time slots.

### Step 1: Create Group Assignments

Assign students to groups (Group 1 or Group 2).

```graphql
mutation AssignGroups {
  # Group 1 (first 30 students)
  insert_group_assignment(
    objects: [
      {user_id: "student-1-uuid", section_id: "section-uuid", group_identifier: "Group 1"}
      {user_id: "student-2-uuid", section_id: "section-uuid", group_identifier: "Group 1"}
      # ... 28 more
    ]
  ) {
    affected_rows
  }
  
  # Group 2 (next 30 students)
  insert_group_assignment(
    objects: [
      {user_id: "student-31-uuid", section_id: "section-uuid", group_identifier: "Group 2"}
      # ... 29 more
    ]
  ) {
    affected_rows
  }
}
```

### Step 2: Create Separate Routines

Create two routines with different time slots.

```graphql
mutation CreateLabRoutines {
  # Group 1: Tuesday 10-12
  insert_event_routine_one(object: {
    name: "CSE 201 Lab - Group 1"
    course_offering_id: "course-uuid"
    day_of_week: 2  # Tuesday
    start_time: "10:00:00"
    end_time: "12:00:00"
    event_type: practical
    effective_from: "2025-01-07"
  }) {
    id
  }
  
  # Group 2: Tuesday 14-16
  insert_event_routine_one(object: {
    name: "CSE 201 Lab - Group 2"
    course_offering_id: "course-uuid"
    day_of_week: 2  # Tuesday
    start_time: "14:00:00"
    end_time: "16:00:00"
    event_type: practical
    effective_from: "2025-01-07"
  }) {
    id
  }
}
```

### Step 3: Generate Events with Group Targeting

When generating events, link them to specific groups.

**Result:** Group 1 students see 10-12 slot, Group 2 students see 14-16 slot automatically.

## Handling Changes and Cancellations

### Room Changes

When a lecture needs to move to a different room:

```graphql
mutation ChangeRoom {
  update_event_room(
    _set: {room_id: "room-305-uuid"}
    where: {event_id: {_eq: "event-uuid"}, is_primary_room: {_eq: true}}
  ) {
    affected_rows
  }
  
  # Log the change (triggers notification)
  insert_event_change_one(object: {
    event_id: "event-uuid"
    changed_by: "admin-uuid"
    change_type: room_change
    old_value: "{\"room_id\": \"room-201-uuid\", \"room_name\": \"Room 201\"}"
    new_value: "{\"room_id\": \"room-305-uuid\", \"room_name\": \"Room 305\"}"
    reason: "AC not working"
  }) {
    id
  }
}
```

**Result:** Students receive a push notification about the room change.

### Cancellations with Reschedule

Cancel an event and create a makeup class:

```graphql
mutation CancelWithReschedule {
  # Create makeup event
  insert_event_one(object: {
    event_type: lecture
    title: "CSE 301 - Makeup Class"
    course_offering_id: "course-uuid"
    date: "2025-01-18"  # Saturday
    start_time: "10:00:00"
    end_time: "11:00:00"
  }) {
    id
  }
  
  # Update original event status
  update_event_by_pk(
    pk_columns: {id: "original-event-uuid"}
    _set: {status: cancelled}
  ) {
    id
  }
  
  # Create cancellation record (triggers urgent notification)
  insert_event_cancellation_one(object: {
    event_id: "original-event-uuid"
    cancelled_by: "teacher-uuid"
    reason: "Instructor unavailable"
    rescheduled_event_id: "makeup-event-uuid"
  }) {
    id
  }
}
```

**Result:** Students receive SMS + Push notification with cancellation reason and reschedule details.

## Attendance

### Marking Attendance for Lectures

```graphql
mutation MarkAttendance {
  insert_event_attendance(
    objects: [
      {event_id: "lecture-uuid", user_id: "student-1-uuid", status: present, marked_by: "teacher-uuid"}
      {event_id: "lecture-uuid", user_id: "student-2-uuid", status: present, marked_by: "teacher-uuid"}
      {event_id: "lecture-uuid", user_id: "student-3-uuid", status: late, marked_by: "teacher-uuid"}
      {event_id: "lecture-uuid", user_id: "student-4-uuid", status: absent, marked_by: "teacher-uuid"}
    ]
  ) {
    affected_rows
  }
}
```

### Checking Exam Attendance

Exam attendance is tracked in `event_participant` records:

```graphql
query GetExamAttendance {
  event_participant(
    where: {event_id: {_eq: "exam-uuid"}}
  ) {
    user {
      profile {
        student_id
        first_name
        last_name
      }
    }
    attendance_status
    checked_in_at
    seat_number
  }
}
```

## Querying Events

### Student's Daily Schedule

```graphql
query MyDailySchedule($date: date!) {
  user_events(
    where: {
      user_id: {_eq: $X-Hasura-User-Id}
      date: {_eq: $date}
      status: {_in: [scheduled, ongoing]}
    }
    order_by: {start_time: asc}
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
          building { name }
        }
        event_instructors {
          instructor {
            profile {
              first_name
              last_name
            }
          }
        }
      }
    }
  }
}
```

### Instructor's Weekly Schedule

```graphql
query InstructorSchedule($instructor_id: uuid!, $start_date: date!, $end_date: date!) {
  event_instructor(
    where: {
      instructor_id: {_eq: $instructor_id}
      event_room: {
        event: {
          date: {_gte: $start_date, _lte: $end_date}
          status: {_in: [scheduled, ongoing]}
        }
      }
    }
    order_by: {event_room: {event: {date: asc, start_time: asc}}}
  ) {
    role
    event_room {
      room { name }
      event {
        title
        event_type
        date
        start_time
        end_time
      }
    }
  }
}
```

## Best Practices

1. **Always use routines** for recurring lectures to save time
2. **Log all changes** for audit trail and automatic notifications
3. **Set appropriate priorities** - urgent for exams, normal for lectures
4. **Test group assignments** before generating events
5. **Handle holidays** using routine_exception
6. **Verify room capacity** before assigning students
7. **Use bulk operations** for seat assignments to avoid manual work

For more details, see the [Event Management System Architecture](/architecture/event-system).
