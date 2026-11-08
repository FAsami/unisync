# Department setup

A department admin sets up their department in the web dashboard. Each step
needs the one before it, so go in this order. Everything is limited to the
admin's own department: another department's records are invisible.

## 1. Department

Check the department's code, name and description. The code is stored in
upper case (for example `CSE`).

## 2. Batches and sections

A **batch** is an intake, for example "2026". It has a year, the current
semester, the number of semesters, and optional start and end dates. A
**section** belongs to a batch (for example "A"), with an optional capacity.

## 3. Courses

Each course has a code, a name, credit hours, the semester it belongs to and a
type (for example theory or lab).

## 4. Rooms

Buildings and rooms are shared by the whole university. Anyone signed in can
see them, and any department admin can add or edit them. Rooms are needed for
the routine, and for moving a class or changing its room.

## 5. Teachers

Add a teacher with their mobile number, name and designation. They can then
sign in to the mobile app with that number.

## 6. Students (the roster)

Add students one by one, or import a list. Each row has:

| Field | Notes |
| --- | --- |
| `phone` | Bangladeshi mobile number. The import matches existing students on it. |
| `firstName`, `lastName` | |
| `studentId` | The university ID |
| section | Either `sectionId`, or `batch` + `section` by name, as in a spreadsheet |

The import:

- **All or nothing.** If any row is wrong, nothing is saved and every row's problem is listed.
- **Can check first.** A dry run checks the rows without saving anything.
- **Safe to repeat.** Importing the same list again changes nothing. A student who was deactivated is reactivated.

To make a student their section's **class representative (CR)**, set the CR mark
on them. A section can have more than one CR. Moving a student to another
section ends their CR mark.

People are **deactivated, never deleted**. Deactivating someone or changing
their number signs them out everywhere and stops pushes to their old phone.

## 7. Offerings

An offering says which teacher teaches which course to which section in an
academic year. Only active teachers of the department can be chosen.

## 8. Weekly routine

For each offering, add its weekly slots:

- weekday, start and end time (campus time, Asia/Dhaka)
- type (lecture, lab, tutorial, exam or other)
- room
- the dates the slot applies between

A slot is refused if it clashes with another slot on the same weekday with
overlapping times and dates. That covers the same section, the same teacher
(across all departments) or the same room. The error names the clash.

Once the routine is in, students and teachers see it in "My day" and the week.

## Access requests

When someone whose number isn't on the roster asks to join, their request
appears in the queue, with their name, student ID and the section they chose.
**Approve** adds them to the roster as a student. **Reject** asks for a reason.

## Removing things

Batches, sections, courses, offerings, buildings and rooms can be deleted only
while nothing uses them. Otherwise the dashboard offers to mark them inactive.
