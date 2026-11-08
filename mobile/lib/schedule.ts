import type { components } from '@/lib/api/generated'

export type ClassOccurrence = components['schemas']['ClassOccurrence']
export type Slot = components['schemas']['Slot']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "09:00:00" → "09:00". */
export const hhmm = (time: string): string => time.slice(0, 5)

/** "2026-11-12" → "Thu 12 Nov" (a calendar date, so no time zone is involved). */
export const shortDate = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return `${DAYS[weekday]} ${d} ${MONTHS[m - 1]}`
}

/** Calendar arithmetic on "YYYY-MM-DD" (UTC, so no daylight-saving or zone drift). */
export const addDays = (date: string, days: number): string => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** "2026-11-09" → { weekday: "Mon", day: 9 } for a day chip. */
export const dayChip = (date: string): { weekday: string; day: number } => {
  const [y, m, d] = date.split('-').map(Number)
  return { weekday: DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()], day: d }
}

const slot = (s: Slot) => `${shortDate(s.date)}, ${hhmm(s.start)}`

export type Tone = 'normal' | 'cancelled' | 'changed'

/** What a student needs to read about one class, already worded. */
export const describeClass = (c: ClassOccurrence): { badge?: string; detail?: string; tone: Tone; struck: boolean } => {
  switch (c.status) {
    case 'cancelled':
      return { badge: 'Cancelled', detail: c.note ?? undefined, tone: 'cancelled', struck: true }
    case 'moved_away':
      return {
        badge: 'Moved',
        detail: c.movedTo ? `Now ${slot(c.movedTo)}–${hhmm(c.movedTo.end)}${c.note ? `. ${c.note}` : ''}` : c.note ?? undefined,
        tone: 'cancelled',
        struck: true,
      }
    case 'moved':
      return {
        badge: 'Moved here',
        detail: c.movedFrom ? `From ${slot(c.movedFrom)}${c.note ? `. ${c.note}` : ''}` : c.note ?? undefined,
        tone: 'changed',
        struck: false,
      }
    case 'room_changed':
      return { badge: 'Room changed', detail: c.room ? `Now in ${c.room}${c.note ? `. ${c.note}` : ''}` : c.note ?? undefined, tone: 'changed', struck: false }
    default:
      return { tone: 'normal', struck: false }
  }
}

/** Course code and name, or the class kind when the routine has no course. */
export const classTitle = (c: ClassOccurrence): string => (c.course ? `${c.course.code} · ${c.course.name}` : c.kind)
