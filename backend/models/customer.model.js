import { ObjectId } from 'mongodb'
import { getDb } from '../db/client.js'

function toIso(value) {
  return value instanceof Date ? value.toISOString() : value ?? null
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function serialize(customer, stats = {}) {
  if (!customer) return null
  return {
    id: customer._id.toHexString(),
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? '',
    status: customer.status ?? 'ACTIVE',
    orderCount: stats.orderCount ?? 0,
    totalSpent: (stats.totalCents ?? 0) / 100,
    createdAt: toIso(customer.createdAt),
  }
}

async function getOrderStats(db) {
  const orders = await db.collection('orders').find({}, { projection: { customerId: 1, totalCents: 1 } }).toArray()
  const stats = new Map()
  for (const order of orders) {
    const key = order.customerId?.toHexString?.() ?? String(order.customerId ?? '')
    const entry = stats.get(key) ?? { orderCount: 0, totalCents: 0 }
    entry.orderCount += 1
    entry.totalCents += order.totalCents ?? 0
    stats.set(key, entry)
  }
  return stats
}

export async function listCustomers({ search, status } = {}) {
  const db = await getDb()
  const filter = {}
  if (status && ['ACTIVE', 'SUSPENDED'].includes(status)) filter.status = status
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i')
    filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }]
  }
  const [customers, stats] = await Promise.all([
    db.collection('customers').find(filter).sort({ createdAt: -1 }).toArray(),
    getOrderStats(db),
  ])
  return customers.map((customer) => serialize(customer, stats.get(customer._id.toHexString())))
}

export async function findCustomerById(id) {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  const [customer, stats] = await Promise.all([
    db.collection('customers').findOne({ _id: new ObjectId(id) }),
    getOrderStats(db),
  ])
  return serialize(customer, stats.get(id))
}

export async function listCustomerOrders(id) {
  if (!ObjectId.isValid(id)) return []
  const db = await getDb()
  const orders = await db.collection('orders').find({ customerId: new ObjectId(id) }).sort({ createdAt: -1 }).toArray()
  return orders.map((order) => ({
    id: order._id.toHexString(),
    orderNumber: order.orderNumber ?? '',
    total: (order.totalCents ?? 0) / 100,
    status: order.status ?? 'PENDING',
    paymentStatus: order.paymentStatus ?? null,
    createdAt: toIso(order.createdAt),
  }))
}

export async function updateCustomer(id, updates) {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  await db.collection('customers').updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })
  return findCustomerById(id)
}
