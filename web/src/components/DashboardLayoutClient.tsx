'use client'

import { Layout, Button, Typography } from 'antd'
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
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
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 99,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            position: 'sticky',
            top: 0,
            zIndex: 98,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {isMobile && (
            <Button
              type='text'
              aria-label='Menu'
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
          <Typography.Text strong ellipsis style={{ flex: 1, minWidth: 0 }}>
            {department.code} · {department.name}
          </Typography.Text>
          {!isMobile && name ? (
            <Typography.Text type='secondary'>{name}</Typography.Text>
          ) : null}
          <Button icon={<LogoutOutlined />} loading={pending} onClick={signOut}>
            {isMobile ? null : 'Sign out'}
          </Button>
        </Header>
        <Content
          style={{
            margin: isMobile ? '16px' : '24px 16px',
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: '#fff',
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
