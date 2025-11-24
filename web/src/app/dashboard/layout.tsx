import { ReactNode } from 'react'
import { getServerSession } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/DashboardLayoutClient'

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession()
  if (!session) {
    redirect(`/auth/login?redirect=${encodeURIComponent('/dashboard')}}`)
  }
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}

export default DashboardLayout
