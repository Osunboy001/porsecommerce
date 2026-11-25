import { ObjectId } from 'mongodb'
import { getDb } from '../db/client.js'

const productLookup = {
  $lookup: {
    from: 'categories',
    localField: 'categoryId',
    foreignField: '_id',
    as: 'categoryDoc',
  },
}

const categoryUnwind = {
  $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true },
}

function toIsoDate(value) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

function serializeProduct(product) {
  const reviews = (product.reviews ?? [])
    .filter((review) => review.status === 'APPROVED')
    .map(({ author, rating, title, body, createdAt }) => ({
      author,
      rating,
      title,
      body,
      createdAt: toIsoDate(createdAt),
    }))

  const rating = reviews.length
    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
    : 0

  return {
    id: product._id.toHexString(),
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.priceCents / 100,
    compareAtPrice: product.compareAtPriceCents ? product.compareAtPriceCents / 100 : null,
    currency: product.currency ?? 'USD',
    stock: product.stock ?? 0,
    featured: Boolean(product.featured),
    category: product.categoryDoc
      ? { name: product.categoryDoc.name, slug: product.categoryDoc.slug }
      : { name: '', slug: '' },
    brand: product.brand ?? null,
    images: [...(product.images ?? [])]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((image) => image.url),
    rating,
    reviewCount: reviews.length,
    reviews,
    badge: product.badge ?? null,
    details: product.details ?? [],
    specs: product.specs ?? [],
  }
}

async function queryProducts(match = {}, options = {}) {
  const db = await getDb()
  const pipeline = [
    { $match: { status: 'ACTIVE', ...match } },
    productLookup,
    categoryUnwind,
    ...(options.category ? [{ $match: { 'categoryDoc.slug': options.category } }] : []),
    { $sort: { featured: -1, position: 1, name: 1 } },
  ]

  if (options.limit) pipeline.push({ $limit: options.limit })

  const products = await db.collection('products').aggregate(pipeline).toArray()
  return products.map(serializeProduct)
}

export async function findActiveProducts({ category } = {}) {
  return queryProducts({}, { category })
}

export async function findActiveProductBySlug(slug) {
  if (!slug || typeof slug !== 'string') return null

  const [product] = await queryProducts({ slug }, { limit: 1 })
  return product ?? null
}

function toIso(value) {
  return value instanceof Date ? value.toISOString() : value ?? null
}

function serializeAdminProduct(product) {
  return {
    id: product._id.toHexString(),
    slug: product.slug,
    sku: product.sku ?? '',
    name: product.name,
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    price: (product.priceCents ?? 0) / 100,
    compareAtPrice: product.compareAtPriceCents ? product.compareAtPriceCents / 100 : null,
    currency: product.currency ?? 'USD',
    stock: product.stock ?? 0,
    status: product.status ?? 'PENDING',
    featured: Boolean(product.featured),
    badge: product.badge ?? null,
    categoryId: product.categoryId?.toHexString?.() ?? product.categoryId ?? null,
    category: product.categoryDoc ? { name: product.categoryDoc.name, slug: product.categoryDoc.slug } : { name: '', slug: '' },
    sellerId: product.sellerId?.toHexString?.() ?? product.sellerId ?? null,
    seller: product.sellerDoc ? { name: product.sellerDoc.name, id: product.sellerDoc._id.toHexString() } : null,
    images: (product.images ?? []).map((image) => image.url),
    reviewCount: (product.reviews ?? []).length,
    position: product.position ?? 0,
    createdAt: toIso(product.createdAt),
  }
}

const adminLookups = [
  {
    $lookup: {
      from: 'categories',
      localField: 'categoryId',
      foreignField: '_id',
      as: 'categoryDoc',
    },
  },
  { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'sellers',
      localField: 'sellerId',
      foreignField: '_id',
      as: 'sellerDoc',
    },
  },
  { $unwind: { path: '$sellerDoc', preserveNullAndEmptyArrays: true } },
]

async function adminAggregate(match = []) {
  const db = await getDb()
  return db
    .collection('products')
    .aggregate([...match, ...adminLookups, { $sort: { createdAt: -1, position: 1 } }])
    .toArray()
}

export async function listAllProducts({ search, status, category, seller } = {}) {
  const match = []
  if (status && status !== 'ALL') match.push({ $match: { status } })
  if (category) match.push({ $match: { 'categoryDoc.slug': category } })
  if (seller && ObjectId.isValid(seller)) match.push({ $match: { sellerId: new ObjectId(seller) } })
  if (search) {
    const pattern = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    match.push({ $match: { $or: [{ name: pattern }, { sku: pattern }] } })
  }
  const db = await getDb()
  const rows = await db
    .collection('products')
    .aggregate([...adminLookups, ...match, { $sort: { createdAt: -1, position: 1 } }])
    .toArray()
  return rows.map(serializeAdminProduct)
}

export async function findProductById(id) {
  if (!ObjectId.isValid(id)) return null
  const rows = await adminAggregate([{ $match: { _id: new ObjectId(id) } }])
  return rows.length ? serializeAdminProduct(rows[0]) : null
}

export async function createProduct(input) {
  const db = await getDb()
  const now = new Date()
  const category = input.categoryId
    ? await db.collection('categories').findOne({ _id: new ObjectId(input.categoryId) })
    : null
  const doc = {
    slug: input.slug,
    sku: input.sku ?? '',
    name: input.name,
    shortDescription: input.shortDescription ?? '',
    description: input.description ?? '',
    priceCents: Math.round(Number(input.price) * 100),
    compareAtPriceCents: null,
    currency: input.currency ?? 'USD',
    stock: Number(input.stock ?? 0),
    status: input.status ?? 'PENDING',
    featured: Boolean(input.featured),
    badge: input.badge ?? null,
    categoryId: category?._id ?? null,
    sellerId: ObjectId.isValid(input.sellerId) ? new ObjectId(input.sellerId) : null,
    images: input.image ? [{ url: input.image, position: 0 }] : [],
    reviews: [],
    details: [],
    specs: [],
    position: Date.now(),
    createdAt: now,
    updatedAt: now,
  }
  const result = await db.collection('products').insertOne(doc)
  return findProductById(result.insertedId.toHexString())
}

export async function updateProduct(id, input) {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  const changes = {}
  for (const key of ['slug', 'sku', 'name', 'shortDescription', 'description', 'badge']) {
    if (input[key] !== undefined) changes[key] = input[key]
  }
  if (input.price !== undefined) changes.priceCents = Math.round(Number(input.price) * 100)
  if (input.stock !== undefined) changes.stock = Number(input.stock)
  if (input.featured !== undefined) changes.featured = Boolean(input.featured)
  if (input.status !== undefined) changes.status = input.status
  if (input.categoryId !== undefined && ObjectId.isValid(input.categoryId)) {
    changes.categoryId = new ObjectId(input.categoryId)
  }
  if (input.sellerId !== undefined) {
    changes.sellerId = ObjectId.isValid(input.sellerId) ? new ObjectId(input.sellerId) : null
  }
  if (input.image !== undefined && input.image) {
    changes.images = [{ url: input.image, position: 0 }]
  }
  changes.updatedAt = new Date()
  await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: changes })
  return findProductById(id)
}

export async function setProductStatus(id, status) {
  return updateProduct(id, { status })
}

export async function deleteProduct(id) {
  if (!ObjectId.isValid(id)) return false
  const db = await getDb()
  const result = await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'ARCHIVED', updatedAt: new Date() } },
  )
  return result.matchedCount > 0
}
