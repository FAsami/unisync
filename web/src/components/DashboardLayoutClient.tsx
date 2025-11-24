'use client'

import { Layout, Button } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import DashboardSidebar from './DashboardSidebar'

const { Content, Header } = Layout

interface DashboardLayoutClientProps {
  children: React.ReactNode
}

const DashboardLayoutClient = ({ children }: DashboardLayoutClientProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <DashboardSidebar collapsed={collapsed} onCollapse={setCollapsed} isMobile={isMobile} />
      {isMobile && !collapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
        {isMobile && (
          <Header
            style={{
              padding: '0 16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 98,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 64, height: 64 }}
            />
          </Header>
        )}
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

export default DashboardLayoutClient

