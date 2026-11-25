import { getDb } from '../db/client.js'
import { resolveDateRange, inRange } from '../lib/date-range.js'
import { listActivities } from '../models/activity.model.js'

function sumOrders(orders) {
  return orders.reduce((total, order) => total + (order.totalCents ?? 0), 0)
}

function buildTrend(orders, range) {
  const end = range.to ?? new Date()
  const start = range.from ?? new Date(end.getTime() - 13 * 86400000)
  const days = Math.min(31, Math.max(1, Math.ceil((end - start) / 86400000) + 1))
  const trend = []
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(end.getTime() - index * 86400000)
    const key = day.toISOString().slice(0, 10)
    const dayOrders = orders.filter((order) => new Date(order.createdAt).toISOString().slice(0, 10) === key)
    trend.push({
      date: key,
      revenue: sumOrders(dayOrders) / 100,
      orders: dayOrders.length,
    })
  }
  return trend
}

export async function listActivity(req, res, next) {
  try {
    const range = resolveDateRange(req.query.range, req.query.from, req.query.to)
    res.json(await listActivities({ from: range.from, to: range.to, limit: 50 }))
  } catch (error) {
    next(error)
  }
}

export async function getDashboard(req, res, next) {
  try {
    const range = resolveDateRange(req.query.range, req.query.from, req.query.to)
    const db = await getDb()
    const [products, categories, sellers, customers, orders] = await Promise.all([
      db.collection('products').find({}).toArray(),
      db.collection('categories').find({}).toArray(),
      db.collection('sellers').find({}).toArray(),
      db.collection('customers').find({}).toArray(),
      db.collection('orders').find({}).toArray(),
    ])

    const rangedOrders = orders.filter((order) => inRange(order.createdAt, range))
    const validOrders = rangedOrders.filter((order) => !['CANCELLED', 'RETURNED'].includes(order.status))
    const revenue = sumOrders(validOrders) / 100
    const statusCounts = {}
    for (const order of rangedOrders) statusCounts[order.status] = (statusCounts[order.status] ?? 0) + 1

    const categoryById = new Map(categories.map((category) => [category._id.toHexString(), category]))
    const productById = new Map(products.map((product) => [product._id.toHexString(), product]))
    const categoryRevenue = new Map()
    for (const order of validOrders) {
      for (const item of order.items ?? []) {
        const product = productById.get(String(item.productId))
        const categoryId = product?.categoryId?.toHexString?.() ?? String(product?.categoryId ?? '')
        const category = categoryById.get(categoryId)?.name ?? 'Uncategorised'
        const amount = (item.priceCents ?? 0) * (item.quantity ?? 1)
        categoryRevenue.set(category, (categoryRevenue.get(category) ?? 0) + amount)
      }
    }

    const sellerById = new Map(sellers.map((seller) => [seller._id.toHexString(), seller]))
    const sellerRevenue = new Map()
    for (const order of validOrders) {
      const key = String(order.sellerId ?? '')
      const entry = sellerRevenue.get(key) ?? { revenue: 0, orders: 0 }
      entry.revenue += order.totalCents ?? 0
      entry.orders += 1
      sellerRevenue.set(key, entry)
    }

    const lowStock = products.filter((product) => product.status === 'ACTIVE' && (product.stock ?? 0) <= 5)

    res.json({
      range: {
        selected: req.query.range ?? '7d',
        from: range.from?.toISOString() ?? null,
        to: range.to?.toISOString() ?? null,
      },
      stats: {
        totalRevenue: revenue,
        totalOrders: rangedOrders.length,
        totalCustomers: customers.length,
        totalSellers: sellers.length,
        totalProducts: products.filter((product) => product.status === 'ACTIVE').length,
        pendingOrders: statusCounts.PENDING ?? 0,
        pendingSellerApplications: sellers.filter((seller) => seller.status === 'PENDING').length,
        pendingProducts: products.filter((product) => product.status === 'PENDING').length,
        cancelledOrders: statusCounts.CANCELLED ?? 0,
        lowStockProducts: lowStock.length,
        deliveredOrders: statusCounts.DELIVERED ?? 0,
        activeSellers: sellers.filter((seller) => seller.status === 'ACTIVE').length,
      },
      charts: {
        trend: buildTrend(validOrders, range),
        orderStatus: Object.entries(statusCounts).map(([status, value]) => ({ label: status, value })),
        categorySales: [...categoryRevenue.entries()]
          .map(([label, value]) => ({ label, value: value / 100 }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6),
        topSellers: [...sellerRevenue.entries()]
          .map(([id, entry]) => ({
            label: sellerById.get(id)?.name ?? 'Unknown seller',
            revenue: entry.revenue / 100,
            orders: entry.orders,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
        lowStock: lowStock.slice(0, 5).map((product) => ({ name: product.name, stock: product.stock ?? 0 })),
      },
      activity: await listActivities({ from: range.from, to: range.to, limit: 8 }),
    })
  } catch (error) {
    next(error)
  }
}
