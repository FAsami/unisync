import { availableActions, changeTarget, isDate, normaliseTime, validateMove } from '../classChanges'
import type { ClassOccurrence } from '../schedule'

const base: ClassOccurrence = {
  routineId: 'r1',
  date: '2026-11-12',
  start: '14:00:00',
  end: '16:00:00',
  status: 'scheduled',
  kind: 'lecture',
  course: { code: 'CSE101', name: 'Programming' },
  section: { id: 's1', name: 'A', batchName: '2026' },
  teacher: 'Rafiq Islam',
  roomId: null,
  room: null,
  note: null,
  movedFrom: null,
  movedTo: null,
}

it('addresses a moved class by its original date, so undo finds the change', () => {
  expect(changeTarget(base)).toEqual({ routineId: 'r1', date: '2026-11-12' })
  const moved = { ...base, status: 'moved', movedFrom: { date: '2026-11-09', start: '09:00:00', end: '11:00:00' } }
  expect(changeTarget(moved)).toEqual({ routineId: 'r1', date: '2026-11-09' })
  // The placeholder on the old slot already carries the original date.
  expect(changeTarget({ ...base, date: '2026-11-09', status: 'moved_away' })).toEqual({ routineId: 'r1', date: '2026-11-09' })
})

it('offers changes on a normal class and only undo on a cancelled or moved one', () => {
  expect(availableActions(base)).toEqual(['cancel', 'move', 'room'])
  expect(availableActions({ ...base, status: 'room_changed' })).toEqual(['cancel', 'move', 'room', 'undo'])
  for (const status of ['cancelled', 'moved', 'moved_away']) {
    expect(availableActions({ ...base, status })).toEqual(['undo'])
  }
  expect(availableActions({ ...base, status: 'something_new' })).toEqual([])
})

it('normalises times and rejects impossible ones', () => {
  expect(normaliseTime('9:05')).toBe('09:05')
  expect(normaliseTime(' 14:30 ')).toBe('14:30')
  expect(normaliseTime('24:00')).toBeUndefined()
  expect(normaliseTime('12:60')).toBeUndefined()
  expect(normaliseTime('2pm')).toBeUndefined()
})

it('accepts only real calendar dates', () => {
  expect(isDate('2026-11-12')).toBe(true)
  expect(isDate('2026-02-30')).toBe(false)
  expect(isDate('12/11/2026')).toBe(false)
})

it('checks a move before sending it', () => {
  expect(validateMove({ date: '2026-11-12', start: '14:00', end: '15:30', reason: 'Lab clash' })).toEqual({})
  expect(validateMove({ date: 'next week', start: '15:00', end: '14:00', reason: ' ' })).toEqual({
    date: 'Enter the new date like 2026-11-12.',
    end: 'The class must end after it starts.',
    reason: 'Tell students why.',
  })
  expect(validateMove({ date: '2026-11-12', start: 'x', end: '', reason: 'ok' })).toMatchObject({
    start: 'Enter a start time like 14:00.',
    end: 'Enter an end time like 15:30.',
  })
})
