import type { PermissionType } from '@/lib/security'

// Permission helper functions
export function checkUserPermissions(
  userPermissions: string[],
  required: PermissionType[]
): boolean {
  return required.every(permission => userPermissions.includes(permission))
}

export function checkAnyPermission(
  userPermissions: string[], 
  required: PermissionType[]
): boolean {
  return required.some(permission => userPermissions.includes(permission))
}

// Permission context type for future role-based access control
export interface PermissionContextType {
  permissions: string[]
  hasPermission: (permission: PermissionType) => boolean
  hasAnyPermission: (permissions: PermissionType[]) => boolean
  hasAllPermissions: (permissions: PermissionType[]) => boolean
}

// Default permissions for different user roles
export const DEFAULT_PERMISSIONS = {
  USER: ['create:post', 'edit:own:post', 'delete:own:post'],
  MODERATOR: ['create:post', 'edit:post', 'delete:post', 'moderate:content'],
  ADMIN: ['create:post', 'edit:post', 'delete:post', 'moderate:content', 'admin:access'],
} as const
