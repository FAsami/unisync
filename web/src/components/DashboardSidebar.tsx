'use client'

import { Badge, Layout, Menu } from 'antd'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Building2,
  BookOpen,
  Building,
  Calendar,
  LayoutDashboard,
  IdCard,
  Link as LinkIcon,
  Users,
  UserPlus,
  User,
} from 'lucide-react'
import { useDashboardSession } from './DashboardSession'

const { Sider } = Layout

interface DashboardSidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  isMobile?: boolean
}

const ICON_SIZE = 18

const ROUTES = [
  {
    key: '/dashboard',
    icon: <LayoutDashboard size={ICON_SIZE} />,
    label: 'Overview',
  },
  {
    key: '/dashboard/access-requests',
    icon: <UserPlus size={ICON_SIZE} />,
    label: 'Access requests',
  },
  {
    key: '/dashboard/department',
    icon: <Building2 size={ICON_SIZE} />,
    label: 'Department',
  },
  {
    key: '/dashboard/batches',
    icon: <Users size={ICON_SIZE} />,
    label: 'Batches & sections',
  },
  {
    key: '/dashboard/courses',
    icon: <BookOpen size={ICON_SIZE} />,
    label: 'Courses',
  },
  {
    key: '/dashboard/teachers',
    icon: <IdCard size={ICON_SIZE} />,
    label: 'Teachers',
  },
  {
    key: '/dashboard/students',
    icon: <User size={ICON_SIZE} />,
    label: 'Students',
  },
  {
    key: '/dashboard/offerings',
    icon: <LinkIcon size={ICON_SIZE} />,
    label: 'Course offerings',
  },
  {
    key: '/dashboard/routine',
    icon: <Calendar size={ICON_SIZE} />,
    label: 'Weekly routine',
  },
  {
    key: '/dashboard/venue',
    icon: <Building size={ICON_SIZE} />,
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
      collapsedWidth={isMobile ? 0 : 64}
      width={232}
      trigger={null}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: isMobile && collapsed ? '-232px' : 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        transition: 'left 0.2s',
        background: 'var(--color-surface-sunken)',
        borderRight: '1px solid var(--color-line)',
      }}
    >
      <div
        style={{
          height: 48,
          margin: '12px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: collapsed ? '4px' : '8px',
        }}
      >
        <Image
          src='/logo-transparent.png'
          alt='UniSync Logo'
          width={collapsed ? 32 : 104}
          height={32}
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
        style={{ borderRight: 0, background: 'transparent' }}
      />
    </Sider>
  )
}

export default DashboardSidebar
