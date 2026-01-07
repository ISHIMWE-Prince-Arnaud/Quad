export const Permission = {
  CREATE_POST: "create:post",
  EDIT_POST: "edit:post",
  DELETE_POST: "delete:post",
  MODERATE_CONTENT: "moderate:content",
  ADMIN_ACCESS: "admin:access",
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];

export function hasPermission(
  userPermissions: string[],
  required: PermissionType
): boolean {
  return userPermissions.includes(required);
}

export function hasAnyPermission(
  userPermissions: string[],
  required: PermissionType[]
): boolean {
  return required.some((permission) => userPermissions.includes(permission));
}

export function hasAllPermissions(
  userPermissions: string[],
  required: PermissionType[]
): boolean {
  return required.every((permission) => userPermissions.includes(permission));
}
