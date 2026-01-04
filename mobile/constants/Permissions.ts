// Role permission mappings
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  CR: 'cr',
  STUDENT: 'student',
} as const

export const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',

  // Course management
  MANAGE_ALL_COURSES: 'manage_all_courses',
  MANAGE_OWN_COURSES: 'manage_own_courses',
  VIEW_COURSES: 'view_courses',

  // Schedule management
  MANAGE_ALL_SCHEDULES: 'manage_all_schedules',
  MANAGE_OWN_SCHEDULES: 'manage_own_schedules',
  VIEW_SCHEDULES: 'view_schedules',

  // Batch & Section management
  MANAGE_BATCHES: 'manage_batches',
  MANAGE_SECTIONS: 'manage_sections',
  VIEW_BATCHES: 'view_batches',

  // Grade management
  MANAGE_GRADES: 'manage_grades',
  VIEW_OWN_GRADES: 'view_own_grades',

  // Section-specific (CR)
  MANAGE_SECTION_ATTENDANCE: 'manage_section_attendance',
  POST_SECTION_ANNOUNCEMENTS: 'post_section_announcements',
  VIEW_SECTION_DETAILS: 'view_section_details',
} as const

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_ALL_COURSES,
    PERMISSIONS.MANAGE_ALL_SCHEDULES,
    PERMISSIONS.MANAGE_BATCHES,
    PERMISSIONS.MANAGE_SECTIONS,
    PERMISSIONS.MANAGE_GRADES,
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_OWN_COURSES,
    PERMISSIONS.MANAGE_OWN_SCHEDULES,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.MANAGE_GRADES,
  ],

  [ROLES.CR]: [
    PERMISSIONS.VIEW_SECTION_DETAILS,
    PERMISSIONS.MANAGE_SECTION_ATTENDANCE,
    PERMISSIONS.POST_SECTION_ANNOUNCEMENTS,
    PERMISSIONS.VIEW_SCHEDULES,
    PERMISSIONS.VIEW_COURSES,
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_SCHEDULES,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.VIEW_OWN_GRADES,
  ],
}

// Helper functions
export const hasPermission = (
  userRole: string | null,
  permission: string
): boolean => {
  if (!userRole) return false
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

export const hasAnyPermission = (
  userRole: string | null,
  permissions: string[]
): boolean => {
  if (!userRole) return false
  return permissions.some((permission) => hasPermission(userRole, permission))
}

export const canManage = (userRole: string | null): boolean => {
  if (!userRole) return false
  // Check if user has any management permissions
  const managementPermissions = [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ALL_COURSES,
    PERMISSIONS.MANAGE_OWN_COURSES,
    PERMISSIONS.MANAGE_ALL_SCHEDULES,
    PERMISSIONS.MANAGE_OWN_SCHEDULES,
    PERMISSIONS.MANAGE_BATCHES,
    PERMISSIONS.MANAGE_SECTIONS,
    PERMISSIONS.MANAGE_GRADES,
    PERMISSIONS.MANAGE_SECTION_ATTENDANCE,
    PERMISSIONS.POST_SECTION_ANNOUNCEMENTS,
  ]
  return hasAnyPermission(userRole, managementPermissions)
}

export type Role = (typeof ROLES)[keyof typeof ROLES]
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
