'use client'

import { createContext, useContext, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Result, Spin } from 'antd'
import { api } from '@/lib/api/client'
import { ApiError, messageOf, unwrap } from '@/lib/api/errors'
import type { Department, Me } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { signOut } from '@/actions/session'

interface DashboardSession {
  me: Me
  department: Department
  pendingRequests: number
  /** Re-read the department and the pending access request count. */
  refresh: () => Promise<void>
}

const SessionContext = createContext<DashboardSession | null>(null)

export const useDashboardSession = (): DashboardSession => {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useDashboardSession outside the dashboard')
  return session
}

export const useSignOut = () => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const run = () =>
    startTransition(async () => {
      await signOut()
      router.replace('/auth/login')
      router.refresh()
    })
  return { signOut: run, pending }
}

type Loaded =
  | { kind: 'ok'; me: Me; department: Department; pending: number }
  | { kind: 'not-admin'; me: Me }
  | { kind: 'no-department'; me: Me }

const loadSession = async (): Promise<Loaded> => {
  const me = await unwrap(api.GET('/api/v1/me'))
  if (me.role !== 'admin') return { kind: 'not-admin', me }
  try {
    const [department, pending] = await Promise.all([
      unwrap(api.GET('/api/v1/department')),
      unwrap(
        api.GET('/api/v1/access-requests', {
          params: { query: { status: 'pending' } },
        })
      ),
    ])
    return { kind: 'ok', me, department, pending: pending.length }
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) {
      return { kind: 'no-department', me }
    }
    throw e
  }
}

/**
 * Loads who is signed in and their department. Only a department admin gets
 * the dashboard; anyone else is pointed to the mobile app.
 */
export const DashboardSessionProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const { data, error, loading, reload } = useLoad('session', loadSession)
  const { signOut: doSignOut, pending: signingOut } = useSignOut()

  if (!data) {
    if (loading) {
      return (
        <div className='min-h-screen flex items-center justify-center'>
          <Spin size='large' />
        </div>
      )
    }
    return (
      <Result
        status='error'
        title='Could not load your dashboard'
        subTitle={messageOf(error)}
        extra={
          <Button type='primary' onClick={() => void reload()}>
            Try again
          </Button>
        }
      />
    )
  }

  if (data.kind !== 'ok') {
    return (
      <div className='min-h-screen flex items-center justify-center p-5'>
        <Result
          status='info'
          title={
            data.kind === 'not-admin'
              ? 'Use the UniSync mobile app'
              : 'Your account has no department yet'
          }
          subTitle={
            data.kind === 'not-admin'
              ? 'UniSync on the web is for department admins. Your schedule, class changes and notices are in the mobile app.'
              : "Your admin account isn't linked to a department. Ask whoever set up UniSync to link it."
          }
          extra={
            <Button loading={signingOut} onClick={doSignOut}>
              Sign out
            </Button>
          }
        />
      </div>
    )
  }

  const value: DashboardSession = {
    me: data.me,
    department: data.department,
    pendingRequests: data.pending,
    refresh: reload,
  }
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
