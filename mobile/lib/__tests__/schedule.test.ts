import { addDays, classTitle, dayChip, describeClass, shortDate, type ClassOccurrence } from '../schedule'

const base: ClassOccurrence = {
  routineId: 'r1',
  date: '2026-11-09',
  start: '09:00:00',
  end: '11:00:00',
  status: 'scheduled',
  kind: 'lecture',
  course: { code: 'CSE101', name: 'Programming' },
  section: { id: 's1', name: 'A', batchName: '2026' },
  teacher: 'Rafiq Islam',
  roomId: null,
  room: '402, Academic Building',
  note: null,
  movedFrom: null,
  movedTo: null,
}

it('formats calendar dates without time-zone drift', () => {
  expect(shortDate('2026-11-09')).toBe('Mon 9 Nov')
  expect(shortDate('2026-11-12')).toBe('Thu 12 Nov')
})

it('describes each class status in words a student understands', () => {
  expect(describeClass(base)).toEqual({ tone: 'normal', struck: false })
  expect(describeClass({ ...base, status: 'cancelled', note: 'Teacher unwell' })).toMatchObject({
    badge: 'Cancelled', detail: 'Teacher unwell', struck: true,
  })
  expect(describeClass({ ...base, status: 'moved_away', movedTo: { date: '2026-11-12', start: '14:00:00', end: '16:00:00' } }).detail)
    .toBe('Now Thu 12 Nov, 14:00–16:00')
  expect(describeClass({ ...base, status: 'moved', movedFrom: { date: '2026-11-09', start: '09:00:00', end: '11:00:00' } }).detail)
    .toBe('From Mon 9 Nov, 09:00')
  expect(describeClass({ ...base, status: 'room_changed', room: '105, Science Building', note: 'Projector broken' }).detail)
    .toBe('Now in 105, Science Building. Projector broken')
})

it('titles a class by its course, or its kind when it has none', () => {
  expect(classTitle(base)).toBe('CSE101 · Programming')
  expect(classTitle({ ...base, course: null })).toBe('lecture')
})

it('moves through weeks by calendar date, across months and years', () => {
  expect(addDays('2026-11-09', 7)).toBe('2026-11-16')
  expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
  expect(addDays('2026-01-02', -7)).toBe('2025-12-26')
  expect(dayChip('2026-11-12')).toEqual({ weekday: 'Thu', day: 12 })
})
