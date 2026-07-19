const ROLE_HOME: Record<string, string> = {
  super_admin: '/admin',
  teacher: '/teacher',
  staff: '/teacher',
  parent: '/parent',
  student: '/student',
  guest: '/guest',
}

const ROLE_PRIORITY = ['super_admin', 'teacher', 'staff', 'parent', 'student', 'guest']

export function getPortalHome(roles: string[]): string {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return ROLE_HOME[role]
  }
  return '/login'
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    teacher: 'Teacher',
    staff: 'Staff',
    parent: 'Parent',
    student: 'Student',
    guest: 'Guest',
  }
  return labels[role] ?? role
}

export function hasAnyRole(userRoles: string[], allowed: string[]): boolean {
  return allowed.some((role) => userRoles.includes(role))
}
