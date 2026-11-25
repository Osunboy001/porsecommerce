import { ObjectId } from 'mongodb'
import { getDb } from '../db/client.js'

function toIso(value) {
  return value instanceof Date ? value.toISOString() : value ?? null
}

function serialize(seller, stats = {}) {
  if (!seller) return null
  return {
    id: seller._id.toHexString(),
    name: seller.name,
    slug: seller.slug,
    ownerName: seller.ownerName ?? '',
    email: seller.email ?? '',
    phone: seller.phone ?? '',
    status: seller.status ?? 'PENDING',
    commissionRate: seller.commissionRate ?? 0,
    rating: seller.rating ?? 0,
    productCount: stats.productCount ?? 0,
    orderCount: stats.orderCount ?? 0,
    revenue: (stats.revenueCents ?? 0) / 100,
    createdAt: toIso(seller.createdAt),
  }
}

async function getStats(db) {
  const [products, orders] = await Promise.all([
    db.collection('products').find({}, { projection: { sellerId: 1 } }).toArray(),
    db.collection('orders').find({}, { projection: { sellerId: 1, totalCents: 1 } }).toArray(),
  ])
  const stats = new Map()
  for (const product of products) {
    const key = product.sellerId?.toHexString?.() ?? String(product.sellerId ?? '')
    const entry = stats.get(key) ?? { productCount: 0, orderCount: 0, revenueCents: 0 }
    entry.productCount += 1
    stats.set(key, entry)
  }
  for (const order of orders) {
    const key = order.sellerId?.toHexString?.() ?? String(order.sellerId ?? '')
    const entry = stats.get(key) ?? { productCount: 0, orderCount: 0, revenueCents: 0 }
    entry.orderCount += 1
    entry.revenueCents += order.totalCents ?? 0
    stats.set(key, entry)
  }
  return stats
}

export async function listSellers() {
  const db = await getDb()
  const [sellers, stats] = await Promise.all([
    db.collection('sellers').find({}).sort({ createdAt: 1 }).toArray(),
    getStats(db),
  ])
  return sellers.map((seller) => serialize(seller, stats.get(seller._id.toHexString())))
}

export async function findSellerById(id) {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  const seller = await db.collection('sellers').findOne({ _id: new ObjectId(id) })
  if (!seller) return null
  const stats = await getStats(db)
  return serialize(seller, stats.get(seller._id.toHexString()))
}

export async function createSeller(data) {
  const db = await getDb()
  const now = new Date()
  const doc = {
    name: data.name,
    slug: data.slug,
    ownerName: data.ownerName ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    status: data.status ?? 'PENDING',
    commissionRate: data.commissionRate ?? 0,
    rating: data.rating ?? 0,
    createdAt: now,
    updatedAt: now,
  }
  const result = await db.collection('sellers').insertOne(doc)
  return serialize({ ...doc, _id: result.insertedId })
}

export async function updateSeller(id, updates) {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  const result = await db.collection('sellers').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  return findSellerById(id).then((seller) => seller ?? serialize(result))
}
