import { z } from 'zod'
import { createSeller, findSellerById, listSellers, updateSeller } from '../models/seller.model.js'
import { logActivity } from '../models/activity.model.js'
import { parse } from '../lib/validate.js'
import { httpError } from '../lib/http-error.js'

const createSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).optional(),
  ownerName: z.string().max(120).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).default('PENDING'),
})

const updateSchema = createSchema.partial().extend({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
})

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function handle(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res)
    } catch (error) {
      next(error)
    }
  }
}

export const list = handle(async (req, res) => {
  res.json(await listSellers())
})

export const getOne = handle(async (req, res) => {
  const seller = await findSellerById(req.params.id)
  if (!seller) throw httpError(404, 'Seller not found')
  res.json(seller)
})

export const create = handle(async (req, res) => {
  const data = parse(createSchema, req.body ?? {})
  const seller = await createSeller({ ...data, slug: data.slug ? slugify(data.slug) : slugify(data.name) })
  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    targetType: 'seller',
    targetId: seller.id,
    summary: `Added seller ${seller.name}`,
  })
  res.status(201).json(seller)
})

export const update = handle(async (req, res) => {
  const data = parse(updateSchema, req.body ?? {})
  const seller = await updateSeller(req.params.id, data)
  if (!seller) throw httpError(404, 'Seller not found')
  const action = data.status === 'ACTIVE' ? 'APPROVE' : data.status === 'REJECTED' || data.status === 'SUSPENDED' ? 'REJECT' : 'UPDATE'
  await logActivity({
    admin: req.admin,
    action,
    targetType: 'seller',
    targetId: seller.id,
    summary: `Set ${seller.name} to ${seller.status}`,
  })
  res.json(seller)
})
