import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env.js'
import { PERMISSIONS, ROLE_PERMISSIONS } from '../config/permissions.js'
import { createAdmin, listAdmins, recordAdminLogin, updateAdmin, verifyAdminPassword } from '../models/admin.model.js'
import { logActivity } from '../models/activity.model.js'
import { effectivePermissions } from '../middlewares/auth.middleware.js'
import { parse } from '../lib/validate.js'
import { httpError } from '../lib/http-error.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const staffSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'SUPPORT', 'VIEWER']).default('VIEWER'),
  permissions: z.array(z.enum(PERMISSIONS)).default([]),
})

const updateStaffSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'SUPPORT', 'VIEWER']).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).optional(),
})

function handle(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res)
    } catch (error) {
      next(error)
    }
  }
}

export const login = handle(async (req, res) => {
  const { email, password } = parse(loginSchema, req.body ?? {})
  const admin = await verifyAdminPassword(email, password, bcrypt.compare)
  if (!admin) throw httpError(401, 'Invalid email or password')
  if (!env.jwtSecret) throw httpError(500, 'JWT_SECRET is not configured')

  const payload = {
    sub: admin.id,
    email: admin.email,
    role: admin.role,
    permissions: effectivePermissions(admin),
  }
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '8h' })
  await recordAdminLogin(admin.id)
  await logActivity({ admin, action: 'LOGIN', targetType: 'admin', targetId: admin.id, summary: `${admin.name} signed in` })
  res.json({ token, admin: { ...admin, permissions: payload.permissions } })
})

export const me = handle(async (req, res) => {
  res.json({ admin: req.admin })
})

export const listStaff = handle(async (_req, res) => {
  res.json(await listAdmins())
})

export const createStaff = handle(async (req, res) => {
  const data = parse(staffSchema, req.body ?? {})
  const existing = await listAdmins()
  if (existing.some((admin) => admin.email === data.email.toLowerCase())) {
    throw httpError(409, 'An admin with this email already exists')
  }
  const passwordHash = await bcrypt.hash(data.password, 10)
  const permissions = data.role === 'SUPER_ADMIN' ? PERMISSIONS : data.permissions
  const admin = await createAdmin({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    permissions,
  })
  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    targetType: 'admin',
    targetId: admin.id,
    summary: `Created ${admin.role} account for ${admin.name}`,
  })
  res.status(201).json(admin)
})

export const updateStaff = handle(async (req, res) => {
  const data = parse(updateStaffSchema, req.body ?? {})
  if (!Object.keys(data).length) throw httpError(400, 'No changes provided')
  const admin = await updateAdmin(req.params.id, data)
  if (!admin) throw httpError(404, 'Staff account not found')
  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    targetType: 'admin',
    targetId: admin.id,
    summary: `Updated staff account ${admin.email}`,
  })
  res.json(admin)
})

export const roleOptions = handle(async (_req, res) => {
  res.json({ roles: Object.keys(ROLE_PERMISSIONS), permissions: PERMISSIONS })
})
