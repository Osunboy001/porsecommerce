import { ObjectId } from 'mongodb'
import { getDb } from '../db/client.js'

function toId(value) {
  if (!value) return null
  return typeof value.toHexString === 'function' ? value.toHexString() : value
}

export async function findActiveCategories() {
  const db = await getDb()
  const categories = await db
    .collection('categories')
    .find({ active: true })
    .sort({ position: 1, name: 1 })
    .toArray()

  return categories.map((category) => ({
    id: category._id.toHexString(),
    slug: category.slug,
    name: category.name,
    description: category.description ?? null,
    imageUrl: category.imageUrl ?? null,
    parentId: toId(category.parentId),
    subcategories: Array.isArray(category.subcategories)
      ? category.subcategories
      : JSON.parse(category.subcategories ?? '[]'),
  }))
}

function toIso(value) {
  return value instanceof Date ? value.toISOString() : value ?? null
}

function serializeAdminCategory(category, productCount = 0) {
  if (!category) return null
  return {
    id: category._id.toHexString(),
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    imageUrl: category.imageUrl ?? null,
    parentId: toId(category.parentId),
    subcategories: Array.isArray(category.subcategories)
      ? category.subcategories
      : JSON.parse(category.subcategories ?? '[]'),
    position: category.position ?? 0,
    active: category.active !== false,
    productCount,
    createdAt: toIso(category.createdAt),
  }
}

export async function listAllCategories() {
  const db = await getDb()
  const [categories, products] = await Promise.all([
    db.collection('categories').find({}).sort({ position: 1, name: 1 }).toArray(),
    db.collection('products').find({}, { projection: { categoryId: 1 } }).toArray(),
  ])
  const counts = new Map()
  for (const product of products) {
    const key = String(product.categoryId ?? '')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return categories.map((category) => serializeAdminCategory(category, counts.get(category._id.toHexString())))
}

export async function findCategoryById(id) {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  const category = await db.collection('categories').findOne({ _id: new ObjectId(id) })
  if (!category) return null
  const count = await db.collection('products').countDocuments({ categoryId: category._id })
  return serializeAdminCategory(category, count)
}

export async function createCategory(input) {
  const db = await getDb()
  const now = new Date()
  const doc = {
    name: input.name,
    slug: input.slug,
    description: input.description ?? '',
    imageUrl: input.imageUrl ?? null,
    parentId: ObjectId.isValid(input.parentId) ? new ObjectId(input.parentId) : null,
    subcategories: input.subcategories ?? [],
    position: Number(input.position ?? 0),
    active: input.active !== false,
    createdAt: now,
    updatedAt: now,
  }
  const result = await db.collection('categories').insertOne(doc)
  return findCategoryById(result.insertedId.toHexString())
}

export async function updateCategory(id, input) {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  const changes = {}
  for (const key of ['name', 'slug', 'description', 'imageUrl', 'position', 'active']) {
    if (input[key] !== undefined) changes[key] = input[key]
  }
  if (input.subcategories !== undefined) changes.subcategories = input.subcategories
  if (input.parentId !== undefined) {
    changes.parentId = ObjectId.isValid(input.parentId) ? new ObjectId(input.parentId) : null
  }
  changes.updatedAt = new Date()
  await db.collection('categories').updateOne({ _id: new ObjectId(id) }, { $set: changes })
  return findCategoryById(id)
}

export async function deleteCategory(id) {
  if (!ObjectId.isValid(id)) return false
  const db = await getDb()
  const result = await db.collection('categories').deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}
