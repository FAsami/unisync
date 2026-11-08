import type { ClassOccurrence } from '@/lib/schedule'

export type ClassAction = 'cancel' | 'move' | 'room' | 'undo'

/**
 * A change is stored against the class's original date. A moved class shows on
 * its new slot (status "moved", movedFrom = where it was), so undoing it from
 * there must address the original date, not the date it now appears on.
 */
export const changeTarget = (c: ClassOccurrence): { routineId: string; date: string } => ({
  routineId: c.routineId,
  date: c.status === 'moved' && c.movedFrom ? c.movedFrom.date : c.date,
})

/**
 * What the person may do with one class (only offered when the API says they
 * may change classes at all). A new decision replaces the previous one on the
 * server, but a cancelled or moved class is undone first, so the student-facing
 * story stays simple: one change at a time.
 */
export const availableActions = (c: ClassOccurrence): ClassAction[] => {
  switch (c.status) {
    case 'scheduled':
      return ['cancel', 'move', 'room']
    case 'room_changed':
      return ['cancel', 'move', 'room', 'undo']
    case 'cancelled':
    case 'moved':
    case 'moved_away':
      return ['undo']
    default:
      return []
  }
}

export const actionLabel: Record<ClassAction, string> = {
  cancel: 'Cancel this class',
  move: 'Move to another time',
  room: 'Change room',
  undo: 'Undo the change',
}

const TIME = /^(\d{1,2}):(\d{2})$/
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** "9:05" → "09:05"; anything that isn't a real 24-hour time → undefined. */
export const normaliseTime = (raw: string): string | undefined => {
  const m = TIME.exec(raw.trim())
  if (!m) return undefined
  const [h, min] = [Number(m[1]), Number(m[2])]
  return h <= 23 && min <= 59 ? `${String(h).padStart(2, '0')}:${m[2]}` : undefined
}

/** A real calendar date written YYYY-MM-DD. */
export const isDate = (raw: string): boolean => {
  const m = DATE.exec(raw.trim())
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d
}

export type MoveForm = { date: string; start: string; end: string; reason: string }

/**
 * Field errors worth catching before the round trip. The server checks the
 * same things (and clashes and past dates), and its messages win when it does.
 */
export const validateMove = (form: MoveForm): Partial<Record<keyof MoveForm, string>> => {
  const errors: Partial<Record<keyof MoveForm, string>> = {}
  if (!isDate(form.date)) errors.date = 'Enter the new date like 2026-11-12.'
  const start = normaliseTime(form.start)
  const end = normaliseTime(form.end)
  if (!start) errors.start = 'Enter a start time like 14:00.'
  if (!end) errors.end = 'Enter an end time like 15:30.'
  else if (start && end <= start) errors.end = 'The class must end after it starts.'
  if (!form.reason.trim()) errors.reason = 'Tell students why.'
  return errors
}
