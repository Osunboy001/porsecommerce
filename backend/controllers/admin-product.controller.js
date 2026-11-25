import { z } from 'zod'
import {
  createProduct,
  deleteProduct,
  findProductById,
  listAllProducts,
  setProductStatus,
  updateProduct,
} from '../models/product.model.js'
import { logActivity } from '../models/activity.model.js'
import { parse } from '../lib/validate.js'
import { httpError } from '../lib/http-error.js'

const statuses = ['PENDING', 'ACTIVE', 'REJECTED', 'ARCHIVED']
const statusSchema = z.enum(statuses)

const createSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(160).optional(),
  sku: z.string().max(60).optional(),
  shortDescription: z.string().max(300).optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().optional(),
  sellerId: z.string().optional(),
  image: z.string().optional(),
  badge: z.string().max(40).optional(),
  featured: z.boolean().optional(),
  status: statusSchema.default('PENDING'),
})

const updateSchema = createSchema.partial().extend({ status: statusSchema.optional() })

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
  const { search, status, category, seller } = req.query
  res.json(await listAllProducts({
    search: typeof search === 'string' && search.trim() ? search.trim() : undefined,
    status: typeof status === 'string' ? status : undefined,
    category: typeof category === 'string' ? category : undefined,
    seller: typeof seller === 'string' ? seller : undefined,
  }))
})

export const getOne = handle(async (req, res) => {
  const product = await findProductById(req.params.id)
  if (!product) throw httpError(404, 'Product not found')
  res.json(product)
})

export const create = handle(async (req, res) => {
  const data = parse(createSchema, req.body ?? {})
  const product = await createProduct({ ...data, slug: data.slug ? slugify(data.slug) : slugify(data.name) })
  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    targetType: 'product',
    targetId: product.id,
    summary: `Added product ${product.name}`,
  })
  res.status(201).json(product)
})

export const update = handle(async (req, res) => {
  const data = parse(updateSchema, req.body ?? {})
  const product = await updateProduct(req.params.id, data)
  if (!product) throw httpError(404, 'Product not found')
  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    targetType: 'product',
    targetId: product.id,
    summary: `Updated product ${product.name}`,
  })
  res.json(product)
})

export const setStatus = handle(async (req, res) => {
  const { status } = parse(z.object({ status: statusSchema }), req.body ?? {})
  const product = await setProductStatus(req.params.id, status)
  if (!product) throw httpError(404, 'Product not found')
  await logActivity({
    admin: req.admin,
    action: status === 'ACTIVE' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'UPDATE',
    targetType: 'product',
    targetId: product.id,
    summary: `Set ${product.name} to ${status}`,
  })
  res.json(product)
})

export const remove = handle(async (req, res) => {
  const product = await findProductById(req.params.id)
  if (!product) throw httpError(404, 'Product not found')
  await deleteProduct(req.params.id)
  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    targetType: 'product',
    targetId: product.id,
    summary: `Archived product ${product.name}`,
  })
  res.json({ ok: true })
})
