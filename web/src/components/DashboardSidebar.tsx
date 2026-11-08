'use client'

import { Badge, Layout, Menu } from 'antd'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  ApartmentOutlined,
  BookOutlined,
  BuildOutlined,
  CalendarOutlined,
  DashboardOutlined,
  IdcardOutlined,
  LinkOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useDashboardSession } from './DashboardSession'

const { Sider } = Layout

interface DashboardSidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  isMobile?: boolean
}

const ROUTES = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Overview' },
  {
    key: '/dashboard/access-requests',
    icon: <UserAddOutlined />,
    label: 'Access requests',
  },
  {
    key: '/dashboard/department',
    icon: <ApartmentOutlined />,
    label: 'Department',
  },
  {
    key: '/dashboard/batches',
    icon: <TeamOutlined />,
    label: 'Batches & sections',
  },
  { key: '/dashboard/courses', icon: <BookOutlined />, label: 'Courses' },
  { key: '/dashboard/teachers', icon: <IdcardOutlined />, label: 'Teachers' },
  { key: '/dashboard/students', icon: <UserOutlined />, label: 'Students' },
  {
    key: '/dashboard/offerings',
    icon: <LinkOutlined />,
    label: 'Course offerings',
  },
  {
    key: '/dashboard/routine',
    icon: <CalendarOutlined />,
    label: 'Weekly routine',
  },
  {
    key: '/dashboard/venue',
    icon: <BuildOutlined />,
    label: 'Buildings & rooms',
  },
]

const DashboardSidebar = ({
  collapsed,
  onCollapse,
  isMobile = false,
}: DashboardSidebarProps) => {
  const router = useRouter()
  const pathname = usePathname() ?? '/dashboard'
  const { pendingRequests } = useDashboardSession()

  const selected =
    [...ROUTES]
      .sort((a, b) => b.key.length - a.key.length)
      .find((r) => pathname === r.key || pathname.startsWith(`${r.key}/`))
      ?.key ?? '/dashboard'

  const items = ROUTES.map((route) => ({
    key: route.key,
    icon: route.icon,
    label:
      route.key === '/dashboard/access-requests' && pendingRequests > 0 ? (
        <span className='flex items-center justify-between'>
          {route.label}
          <Badge count={pendingRequests} size='small' />
        </span>
      ) : (
        route.label
      ),
  }))

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
          height={40}
          style={{ objectFit: 'contain', transition: 'all 0.2s' }}
          priority
        />
      </div>
      <Menu
        theme='dark'
        mode='inline'
        selectedKeys={[selected]}
        items={items}
        onClick={({ key }) => {
          router.push(key)
          if (isMobile) onCollapse(true)
        }}
        style={{ borderRight: 0 }}
      />
    </Sider>
  )
}

export default DashboardSidebar
