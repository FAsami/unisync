-- "My day" (UX review decision 2): each class occurrence resolved with
-- cancellations, moves and room changes.

-- 1. Class times become plain campus-local times. The legacy columns were
--    time-with-time-zone, but mobile wrote "+06" and web wrote no offset, while
--    both apps display only the clock digits. Keep those digits: that is what
--    every user saw. (Writers that still send "+06" keep working: Postgres
--    ignores an offset given for a plain time column.)
ALTER TABLE event.routine
    ALTER COLUMN start_time TYPE time USING start_time::time,
    ALTER COLUMN end_time TYPE time USING end_time::time;

ALTER TABLE event.routine
    ADD CONSTRAINT routine_ends_after_start CHECK (end_time > start_time) NOT VALID,
    ADD CONSTRAINT routine_day_of_week_range CHECK (day_of_week BETWEEN 0 AND 6) NOT VALID;

COMMENT ON COLUMN event.routine.start_time IS 'Campus-local time (Asia/Dhaka).';
COMMENT ON COLUMN event.routine.day_of_week IS '0 = Sunday ... 6 = Saturday.';

-- 2. A real room per class, replacing free-text metadata.room_number
--    (still read as a fallback label until every routine has a room).
ALTER TABLE event.routine
    ADD COLUMN room_id uuid REFERENCES venue.room (id) ON DELETE SET NULL;

-- 3. Exceptions can move a class or change its room, not only cancel it.
UPDATE event.routine_exception
   SET type = 'cancellation'
 WHERE type NOT IN ('cancellation', 'reschedule', 'room_change');

ALTER TABLE event.routine_exception
    ADD COLUMN new_date date,
    ADD COLUMN new_start_time time,
    ADD COLUMN new_end_time time,
    ADD COLUMN new_room_id uuid REFERENCES venue.room (id) ON DELETE SET NULL,
    ADD CONSTRAINT routine_exception_type CHECK (type IN ('cancellation', 'reschedule', 'room_change')),
    ADD CONSTRAINT routine_exception_fields_match_type CHECK (
        CASE type
            WHEN 'cancellation' THEN new_date IS NULL AND new_start_time IS NULL AND new_end_time IS NULL AND new_room_id IS NULL
            WHEN 'reschedule' THEN new_date IS NOT NULL AND new_start_time IS NOT NULL AND new_end_time IS NOT NULL AND new_end_time > new_start_time
            WHEN 'room_change' THEN new_room_id IS NOT NULL AND new_date IS NULL AND new_start_time IS NULL AND new_end_time IS NULL
        END);

COMMENT ON COLUMN event.routine_exception.type IS
    'cancellation | reschedule (new_date + new times, optional new_room_id) | room_change (new_room_id)';

-- One decision per class occurrence: keep the newest if duplicates exist.
DELETE FROM event.routine_exception older
 USING event.routine_exception newer
 WHERE older.routine_id = newer.routine_id
   AND older.exception_date = newer.exception_date
   AND (older.created_at, older.id) < (newer.created_at, newer.id);

CREATE UNIQUE INDEX routine_exception_one_per_occurrence
    ON event.routine_exception (routine_id, exception_date);
CREATE INDEX routine_exception_moved_to
    ON event.routine_exception (new_date) WHERE type = 'reschedule';
