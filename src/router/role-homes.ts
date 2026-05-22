import type { Profile } from '@/types/profile'

const ROLE_HOME: Record<Profile['role'], string> = {
  admin: 'admin-dashboard',
  nutritionist: 'admin-users',
  user: 'user-dashboard',
}

export function homeForRole(role: Profile['role'] | undefined): string {
  return (role && ROLE_HOME[role]) ?? 'login'
}
