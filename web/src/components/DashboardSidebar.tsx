'use client'

import { Layout, Menu } from 'antd'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { BookOutlined, BuildOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons'

const { Sider } = Layout

interface DashboardSidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  isMobile?: boolean
}

const DashboardSidebar = ({
  collapsed,
  onCollapse,
  isMobile = false,
}: DashboardSidebarProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'venue') {
      router.push('/dashboard/venue')
    } else if (key === 'academic') {
      router.push('/dashboard/academic')
    } else if (key === 'routine') {
      router.push('/dashboard/routine')
    } else if (key === 'instructor') {
      router.push('/dashboard/instructor')
    }
  }

  const menuItems = [
    {
      key: 'academic',
      icon: <BookOutlined />,
      label: 'Academic Management',
    },
    {
      key: 'venue',
      icon: <BuildOutlined />,
      label: 'Building & Rooms',
    },
    {
      key: 'routine',
      icon: <CalendarOutlined />,
      label: 'Routine Management',
    },
    {
      key: 'instructor',
      icon: <UserOutlined />,
      label: 'Instructor Management',
    },
  ]

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint='lg'
      collapsedWidth={isMobile ? 0 : 80}
      width={250}
      trigger={null}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: isMobile && collapsed ? '-250px' : 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        transition: 'left 0.2s',
      }}
    >
      <div
        style={{
          height: 64,
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: collapsed ? '8px' : '12px',
        }}
      >
        <Image
          src='/logo-transparent.png'
          alt='UniSync Logo'
          width={collapsed ? 40 : 120}
          height={collapsed ? 40 : 40}
          style={{
            objectFit: 'contain',
            transition: 'all 0.2s',
          }}
          priority
        />
      </div>
      <Menu
        theme='dark'
        mode='inline'
        selectedKeys={
          pathname?.includes('/venue')
            ? ['venue']
            : pathname?.includes('/academic')
              ? ['academic']
              : pathname?.includes('/routine')
                ? ['routine']
                : pathname?.includes('/instructor')
                  ? ['instructor']
                  : []
        }
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  )
}

export default DashboardSidebar
