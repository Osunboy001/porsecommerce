import { getDb } from '../db/client.js'

function serialize(row) {
  return {
    id: row._id.toHexString(),
    adminId: row.adminId ?? null,
    adminName: row.adminName ?? 'System',
    action: row.action,
    targetType: row.targetType ?? null,
    targetId: row.targetId ?? null,
    summary: row.summary ?? '',
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  }
}

export async function logActivity({ admin, action, targetType, targetId, summary }) {
  const db = await getDb()
  const doc = {
    adminId: admin?.id ?? null,
    adminName: admin?.name ?? 'System',
    action,
    targetType: targetType ?? null,
    targetId: targetId ?? null,
    summary: summary ?? '',
    createdAt: new Date(),
  }
  const result = await db.collection('activity_logs').insertOne(doc)
  return serialize({ ...doc, _id: result.insertedId })
}

export async function listActivities({ from, to, limit = 20 } = {}) {
  const db = await getDb()
  const filter = {}
  if (from || to) {
    filter.createdAt = {}
    if (from) filter.createdAt.$gte = from
    if (to) filter.createdAt.$lte = to
  }
  const rows = await db.collection('activity_logs').find(filter).sort({ createdAt: -1 }).limit(limit).toArray()
  return rows.map(serialize)
}

export async function countActivities({ from, to } = {}) {
  const db = await getDb()
  const filter = {}
  if (from || to) {
    filter.createdAt = {}
    if (from) filter.createdAt.$gte = from
    if (to) filter.createdAt.$lte = to
  }
  return db.collection('activity_logs').countDocuments(filter)
}
