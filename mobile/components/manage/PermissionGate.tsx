import React from 'react'
import { hasPermission } from '@/constants/Permissions'
import { useAuth } from '@/contexts/Auth'

interface PermissionGateProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that conditionally renders children based on user permissions
 * Usage: <PermissionGate permission="manage_courses">...</PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { userRole } = useAuth()

  if (hasPermission(userRole, permission)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
