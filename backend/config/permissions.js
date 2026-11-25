export const PERMISSIONS = [
  'dashboard.view',
  'products.view',
  'products.manage',
  'categories.view',
  'categories.manage',
  'sellers.view',
  'sellers.manage',
  'customers.view',
  'customers.manage',
  'staff.manage',
  'activity.view',
]

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: PERMISSIONS,
  MANAGER: ['dashboard.view', 'products.view', 'products.manage', 'categories.view', 'categories.manage', 'sellers.view', 'customers.view', 'activity.view'],
  SUPPORT: ['dashboard.view', 'products.view', 'categories.view', 'sellers.view', 'customers.view', 'customers.manage'],
  VIEWER: ['dashboard.view', 'products.view', 'categories.view', 'sellers.view', 'customers.view'],
}
