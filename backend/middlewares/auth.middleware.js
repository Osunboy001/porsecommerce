import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ROLE_PERMISSIONS } from '../config/permissions.js'
import { findAdminById } from '../models/admin.model.js'
import { httpError } from '../lib/http-error.js'

export function effectivePermissions(admin) {
  if (admin.role === 'SUPER_ADMIN') return ROLE_PERMISSIONS.SUPER_ADMIN
  const rolePermissions = ROLE_PERMISSIONS[admin.role] ?? []
  return [...new Set([...rolePermissions, ...(admin.permissions ?? [])])]
}

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization ?? ''
    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token || !env.jwtSecret) throw httpError(401, 'Authentication required')

    const payload = jwt.verify(token, env.jwtSecret)
    const admin = await findAdminById(payload.sub)
    if (!admin || admin.status !== 'ACTIVE') throw httpError(401, 'Authentication required')

    req.admin = { ...admin, permissions: effectivePermissions(admin) }
    next()
  } catch (error) {
    next(error.status ? error : httpError(401, 'Invalid or expired session'))
  }
}

export function requirePermission(...allowed) {
  return (req, _res, next) => {
    if (!req.admin) return next(httpError(401, 'Authentication required'))
    if (req.admin.role === 'SUPER_ADMIN') return next()
    const granted = req.admin.permissions ?? []
    if (allowed.some((permission) => granted.includes(permission))) return next()
    return next(httpError(403, 'You do not have permission to perform this action'))
  }
}
