import { ObjectId } from 'mongodb'
import { getDb } from '../db/client.js'

function toIso(value) {
  return value instanceof Date ? value.toISOString() : value ?? null
}

function serializeAdmin(admin) {
  if (!admin) return null
  return {
    id: admin._id.toHexString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions ?? [],
    status: admin.status ?? 'ACTIVE',
    lastLoginAt: toIso(admin.lastLoginAt),
    createdAt: toIso(admin.createdAt),
  }
}

async function admins() {
  const db = await getDb()
  return db.collection('admins')
}

export async function findAdminByEmail(email) {
  if (typeof email !== 'string') return null
  const collection = await admins()
  return serializeAdmin(await collection.findOne({ email: email.trim().toLowerCase() }))
}

export async function findAdminById(id) {
  if (!ObjectId.isValid(id)) return null
  const collection = await admins()
  return serializeAdmin(await collection.findOne({ _id: new ObjectId(id) }))
}

export async function listAdmins() {
  const collection = await admins()
  const rows = await collection.find({}).sort({ createdAt: 1 }).toArray()
  return rows.map(serializeAdmin)
}

export async function createAdmin({ name, email, passwordHash, role, permissions }) {
  const collection = await admins()
  const now = new Date()
  const doc = {
    name,
    email: email.trim().toLowerCase(),
    passwordHash,
    role,
    permissions,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  }
  const result = await collection.insertOne(doc)
  return serializeAdmin({ ...doc, _id: result.insertedId })
}

export async function updateAdmin(id, updates) {
  if (!ObjectId.isValid(id)) return null
  const collection = await admins()
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  return serializeAdmin(result)
}

export async function recordAdminLogin(id) {
  if (!ObjectId.isValid(id)) return
  const collection = await admins()
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: { lastLoginAt: new Date() } })
}

export async function verifyAdminPassword(email, password, compare) {
  if (typeof email !== 'string' || typeof password !== 'string') return null
  const collection = await admins()
  const admin = await collection.findOne({ email: email.trim().toLowerCase() })
  if (!admin || admin.status !== 'ACTIVE') return null
  const matches = await compare(password, admin.passwordHash)
  return matches ? serializeAdmin(admin) : null
}
