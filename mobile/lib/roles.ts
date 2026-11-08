/**
 * Roles are student, teacher and department admin; CR is a mark on a student
 * (MeResponse.isClassRepresentative), never a role. Older tokens may still say
 * "class_representative", which the API treats as a student.
 */
export type Role = 'student' | 'teacher' | 'admin' | 'class_representative' | (string & {})

/** Who gets the Send tab: the people the API lets address an audience. */
export const canSend = (role: Role | null | undefined, isClassRepresentative = false): boolean =>
  role === 'teacher' || role === 'admin' || isClassRepresentative || role === 'class_representative'

/** "Student", "Student · CR", "Teacher", "Department admin". */
export const roleLabel = (role: Role | null | undefined, isClassRepresentative = false): string => {
  switch (role) {
    case 'teacher':
      return 'Teacher'
    case 'admin':
      return 'Department admin'
    case 'student':
    case 'class_representative':
      return isClassRepresentative || role === 'class_representative' ? 'Student · CR' : 'Student'
    default:
      return 'Member'
  }
}

/** Where department setup lives now (UX review: web for setup, mobile for day-of-class actions). */
export const WEB_DASHBOARD_URL = 'https://www.uni-sync.site/dashboard'
