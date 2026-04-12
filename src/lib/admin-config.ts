export type Role = "superadmin" | "admin" | "editor" | "viewer"

export const ADMIN_EMAILS: Record<string, Role> = {
  "mrdavolatech@gmail.com": "superadmin",
  "snicollo@gmail.com": "superadmin",
  "barbarajauregui@gmail.com": "superadmin",
}

export const ROLE_PERMISSIONS: Record<
  Role,
  {
    canEdit: boolean
    canPublish: boolean
    canDelete: boolean
    canManageUsers: boolean
    canViewHistory: boolean
  }
> = {
  superadmin: {
    canEdit: true,
    canPublish: true,
    canDelete: true,
    canManageUsers: true,
    canViewHistory: true,
  },
  admin: {
    canEdit: true,
    canPublish: true,
    canDelete: true,
    canManageUsers: false,
    canViewHistory: true,
  },
  editor: {
    canEdit: true,
    canPublish: false,
    canDelete: false,
    canManageUsers: false,
    canViewHistory: true,
  },
  viewer: {
    canEdit: false,
    canPublish: false,
    canDelete: false,
    canManageUsers: false,
    canViewHistory: false,
  },
}
