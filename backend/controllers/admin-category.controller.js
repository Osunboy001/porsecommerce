import { z } from 'zod'
import {
  createCategory,
  deleteCategory,
  findCategoryById,
  listAllCategories,
  updateCategory,
} from '../models/category.model.js'
import { logActivity } from '../models/activity.model.js'
import { parse } from '../lib/validate.js'
import { httpError } from '../lib/http-error.js'

const schema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  parentId: z.string().nullable().optional(),
  subcategories: z.array(z.string().min(1)).default([]),
  position: z.coerce.number().int().min(0).optional(),
  active: z.boolean().optional(),
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

export const list = handle(async (_req, res) => {
  res.json(await listAllCategories())
})

export const getOne = handle(async (req, res) => {
  const category = await findCategoryById(req.params.id)
  if (!category) throw httpError(404, 'Category not found')
  res.json(category)
})

export const create = handle(async (req, res) => {
  const data = parse(schema, req.body ?? {})
  const category = await createCategory({ ...data, slug: data.slug ? slugify(data.slug) : slugify(data.name) })
  await logActivity({
    admin: req.admin,
    action: 'CREATE',
    targetType: 'category',
    targetId: category.id,
    summary: `Created category ${category.name}`,
  })
  res.status(201).json(category)
})

export const update = handle(async (req, res) => {
  const data = parse(schema.partial(), req.body ?? {})
  if (data.slug) data.slug = slugify(data.slug)
  const category = await updateCategory(req.params.id, data)
  if (!category) throw httpError(404, 'Category not found')
  await logActivity({
    admin: req.admin,
    action: 'UPDATE',
    targetType: 'category',
    targetId: category.id,
    summary: `Updated category ${category.name}`,
  })
  res.json(category)
})

export const remove = handle(async (req, res) => {
  const category = await findCategoryById(req.params.id)
  if (!category) throw httpError(404, 'Category not found')
  if (category.productCount > 0) throw httpError(409, 'Move or archive products in this category before deleting it')
  await deleteCategory(req.params.id)
  await logActivity({
    admin: req.admin,
    action: 'DELETE',
    targetType: 'category',
    targetId: category.id,
    summary: `Deleted category ${category.name}`,
  })
  res.json({ ok: true })
})
