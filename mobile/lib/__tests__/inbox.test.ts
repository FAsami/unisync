import { emptyInbox, inboxIcon, markAllRead, markRead, mergePage, relativeTime, sentStatus, type InboxItem, type SentItem } from '../inbox'

const item = (id: string, read = false, data: Record<string, string> = {}): InboxItem => ({
  id,
  title: `T${id}`,
  body: 'b',
  kind: data.type ?? 'notice',
  data,
  from: 'Rafiq Islam',
  createdAt: '2026-11-09T08:00:00Z',
  read,
})

it('replaces on the first page and appends later pages without duplicates', () => {
  const first = mergePage(emptyInbox, { items: [item('1'), item('2', true)], unreadCount: 1, nextBefore: '2026-11-01T00:00:00Z' }, false)
  expect(first.items.map((i) => i.id)).toEqual(['1', '2'])
  expect(first.unreadCount).toBe(1)

  const more = mergePage(first, { items: [item('2', true), item('3')], unreadCount: '2', nextBefore: null }, true)
  expect(more.items.map((i) => i.id)).toEqual(['1', '2', '3'])
  expect(more.unreadCount).toBe(2)
  expect(more.nextBefore).toBeNull()
})

it('marks one read once, and all read', () => {
  const state = { items: [item('1'), item('2', true)], unreadCount: 1, nextBefore: null }
  const once = markRead(state, '1')
  expect(once.unreadCount).toBe(0)
  expect(once.items[0].read).toBe(true)
  expect(markRead(once, '1')).toBe(once) // already read: nothing changes
  expect(markRead(state, 'missing')).toBe(state)
  expect(markAllRead({ ...state, unreadCount: 5 })).toMatchObject({ unreadCount: 0, items: [{ read: true }, { read: true }] })
})

it('picks an icon from the class change', () => {
  expect(inboxIcon(item('1', false, { type: 'class_change', change: 'cancelled' }))).toBe('cancelled')
  expect(inboxIcon(item('1', false, { type: 'class_change', change: 'restored' }))).toBe('restored')
  expect(inboxIcon(item('1'))).toBe('announcement')
})

it('describes a sent notice by its push, never implying the inbox missed it', () => {
  const sent: SentItem = {
    id: 'n1',
    title: 't',
    body: 'b',
    audience: 'CSE 2026 · Section A',
    status: 'sent',
    sentCount: 1,
    failedCount: 0,
    readCount: 3,
    createdAt: '2026-11-09T08:00:00Z',
  }
  expect(sentStatus(sent)).toEqual({ label: 'Pushed to 1 phone', tone: 'success' })
  expect(sentStatus({ ...sent, sentCount: '12' }).label).toBe('Pushed to 12 phones')
  expect(sentStatus({ ...sent, status: 'pending' }).tone).toBe('info')
  expect(sentStatus({ ...sent, status: 'failed' }).label).toBe('Push not delivered (it is in their inbox)')
})

it('words times relative to now', () => {
  const now = new Date('2026-11-09T12:00:00Z')
  expect(relativeTime('2026-11-09T11:59:30Z', now)).toBe('just now')
  expect(relativeTime('2026-11-09T11:55:00Z', now)).toBe('5 min ago')
  expect(relativeTime('2026-11-09T09:00:00Z', now)).toBe('3 h ago')
  expect(relativeTime('2026-11-07T12:00:00Z', now)).toBe('2 d ago')
})
