import type { components } from '@/lib/api/generated'

export type InboxItem = components['schemas']['InboxItem']
export type InboxPage = components['schemas']['InboxPage']

export type InboxState = { items: InboxItem[]; unreadCount: number; nextBefore: string | null }

export const emptyInbox: InboxState = { items: [], unreadCount: 0, nextBefore: null }

/** First page replaces the list; later pages append, skipping anything already shown. */
export const mergePage = (state: InboxState, page: InboxPage, append: boolean): InboxState => {
  const unreadCount = Number(page.unreadCount)
  if (!append) return { items: page.items, unreadCount, nextBefore: page.nextBefore }
  const seen = new Set(state.items.map((i) => i.id))
  return {
    items: [...state.items, ...page.items.filter((i) => !seen.has(i.id))],
    unreadCount,
    nextBefore: page.nextBefore,
  }
}

/** Optimistically mark one as read (opening it); the count only drops if it was unread. */
export const markRead = (state: InboxState, id: string): InboxState => {
  const target = state.items.find((i) => i.id === id)
  if (!target || target.read) return state
  return {
    ...state,
    items: state.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
    unreadCount: Math.max(0, state.unreadCount - 1),
  }
}

export const markAllRead = (state: InboxState): InboxState => ({
  ...state,
  items: state.items.map((i) => (i.read ? i : { ...i, read: true })),
  unreadCount: 0,
})

export type InboxIconKind = 'cancelled' | 'moved' | 'roomChanged' | 'restored' | 'classChange' | 'announcement'

/** Icon for a notice, from its kind ("class_change", "announcement", ...) and class-change data. */
export const inboxIcon = (item: InboxItem): InboxIconKind => {
  if (item.kind === 'class_change' || item.data.change) {
    switch (item.data.change) {
      case 'cancelled':
        return 'cancelled'
      case 'moved':
        return 'moved'
      case 'room_changed':
        return 'roomChanged'
      case 'restored':
        return 'restored'
      default:
        return 'classChange'
    }
  }
  return 'announcement'
}

export type SentItem = components['schemas']['SentItem']

/**
 * How a sent notice is doing, in the sender's words. Every notice is in its
 * audience's inboxes as soon as it's sent; the status is only about the push.
 */
export const sentStatus = (item: SentItem): { label: string; tone: 'info' | 'success' | 'warning' } => {
  const phones = Number(item.sentCount)
  switch (item.status) {
    case 'pending':
    case 'processing':
      return { label: 'Sending push…', tone: 'info' }
    case 'sent':
      return { label: `Pushed to ${phones} ${phones === 1 ? 'phone' : 'phones'}`, tone: 'success' }
    case 'failed':
      return { label: 'Push not delivered (it is in their inbox)', tone: 'warning' }
    default:
      return { label: item.status, tone: 'info' }
  }
}

/** "just now", "5 min ago", "3 h ago", "2 d ago", or the date. */
export const relativeTime = (iso: string, now: Date = new Date()): string => {
  const seconds = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
