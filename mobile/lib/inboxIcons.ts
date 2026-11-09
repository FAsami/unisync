import { ArrowLeftRight, Building2, Calendar, CheckCircle2, Megaphone, XCircle } from 'lucide-react-native'
import type { InboxIconKind } from '@/lib/inbox'

/** One Lucide icon per inbox notice kind, matching the design system's unified icon set. */
export const INBOX_ICONS: Record<InboxIconKind, typeof Megaphone> = {
  cancelled: XCircle,
  moved: ArrowLeftRight,
  roomChanged: Building2,
  restored: CheckCircle2,
  classChange: Calendar,
  announcement: Megaphone,
}
