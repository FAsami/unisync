import { ReactNode } from 'react'
import DashboardLayoutClient from '@/components/DashboardLayoutClient'

// middleware.ts sends visitors without a session to /auth/login; the client
// layout checks the role (department admins only).
const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <DashboardLayoutClient>{children}</DashboardLayoutClient>
)

export default DashboardLayout
