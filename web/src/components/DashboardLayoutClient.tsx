'use client'

import { Layout, Button, Typography } from 'antd'
import { LogOut, Menu as MenuIcon, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import DashboardSidebar from './DashboardSidebar'
import {
  DashboardSessionProvider,
  useDashboardSession,
  useSignOut,
} from './DashboardSession'

const { Content, Header } = Layout

const Shell = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { me, department } = useDashboardSession()
  const { signOut, pending } = useSignOut()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992)
      if (window.innerWidth < 992) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const name = [me.firstName, me.lastName].filter(Boolean).join(' ')

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <DashboardSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        isMobile={isMobile}
      />
      {isMobile && !collapsed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-overlay)',
            zIndex: 99,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
          transition: 'margin-left 0.2s',
          background: 'var(--color-surface)',
        }}
      >
        <Header
          style={{
            padding: '0 16px',
            background: 'var(--color-surface-raised)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            position: 'sticky',
            top: 0,
            zIndex: 98,
            borderBottom: '1px solid var(--color-line)',
          }}
        >
          {isMobile && (
            <Button
              type='text'
              aria-label='Menu'
              icon={collapsed ? <MenuIcon size={18} /> : <X size={18} />}
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
          <Typography.Text strong ellipsis style={{ flex: 1, minWidth: 0 }}>
            {department.code} · {department.name}
          </Typography.Text>
          {!isMobile && name ? (
            <Typography.Text type='secondary'>{name}</Typography.Text>
          ) : null}
          <Button
            icon={<LogOut size={16} />}
            loading={pending}
            onClick={signOut}
          >
            {isMobile ? null : 'Sign out'}
          </Button>
        </Header>
        <Content
          style={{
            margin: isMobile ? '16px' : '24px 16px',
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: 'var(--color-surface-raised)',
            borderRadius: 16,
            border: '1px solid var(--color-line)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

const DashboardLayoutClient = ({ children }: { children: React.ReactNode }) => (
  <DashboardSessionProvider>
    <Shell>{children}</Shell>
  </DashboardSessionProvider>
)

export default DashboardLayoutClient
