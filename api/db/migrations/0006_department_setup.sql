-- Department setup on web (UX review: web for setup). The .NET API now creates
-- teachers itself; a teacher belongs to a department, and the legacy
-- "faculty" grouping (academic.faculty, a school of departments) is optional.

ALTER TABLE "user".faculty ALTER COLUMN faculty_id DROP NOT NULL;

COMMENT ON TABLE "user".faculty IS 'Teacher details: one row per teacher account (user_id), in one department.';
COMMENT ON COLUMN "user".faculty.faculty_id IS 'Optional academic.faculty (school) grouping; NULL when not used.';

-- Clash checks for the weekly routine look up active slots by day.
CREATE INDEX routine_active_by_day ON event.routine (day_of_week, start_time) WHERE is_active;
