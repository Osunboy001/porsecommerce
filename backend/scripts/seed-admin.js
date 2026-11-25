import bcrypt from 'bcryptjs'
import { MongoClient, ObjectId } from 'mongodb'
import { env } from '../config/env.js'

function objectId(prefix, index) {
  return new ObjectId(Buffer.from(`${prefix}${String(index).padStart(9, '0')}`))
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const now = new Date()
const daysAgo = (days) => new Date(now.getTime() - days * 86400000)

const superAdminPassword = env.seedAdminPassword || ''
const generatedPassword = superAdminPassword ? '' : `Porse@${Math.random().toString(36).slice(2, 10)}Aa1!`
const superAdmin = {
  _id: objectId('adm', 1),
  name: 'Super Admin',
  email: env.seedAdminEmail.trim().toLowerCase(),
  passwordHash: await bcrypt.hash(superAdminPassword || generatedPassword, 10),
  role: 'SUPER_ADMIN',
  permissions: [],
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: daysAgo(120),
  updatedAt: now,
}

const otherAdmins = [
  { name: 'Grace Manager', email: 'manager@porsecommerce.test', role: 'MANAGER' },
  { name: 'Tobi Support', email: 'support@porsecommerce.test', role: 'SUPPORT' },
  { name: 'Ada Viewer', email: 'viewer@porsecommerce.test', role: 'VIEWER' },
]

const adminPasswordHash = await bcrypt.hash(superAdminPassword || generatedPassword || 'Demo@Pass123', 10)
const admins = [
  superAdmin,
  ...otherAdmins.map((admin, index) => ({
    _id: objectId('adm', index + 2),
    ...admin,
    passwordHash: adminPasswordHash,
    permissions: [],
    status: 'ACTIVE',
    lastLoginAt: null,
    createdAt: daysAgo(100 - index * 10),
    updatedAt: now,
  })),
]

const customerNames = [
  'Chinedu Okafor', 'Maya Thompson', 'Adaeze Nwosu', 'Tunde Bakare', 'Ngozi Eze',
  'Ifeoluwa Ojo', 'Zainab Bello', 'Emmanuel Ude', 'Bisi Adebayo', 'Kelechi Ibe',
  'Fatima Musa', 'Segun Adeyemi', 'Amara Obi', 'Damilola Fayemi', 'Hauwa Abdullahi',
  'Olamide Cole', 'Nneka Okoro', 'Yusuf Mohammed', 'Temitope Alabi', 'Chiamaka Nwankwo',
  'Femi Balogun', 'Aisha Danladi', 'Obinna Ezeh', 'Bolanle Adeleke',
]

const customers = customerNames.map((name, index) => ({
  _id: objectId('cus', index + 1),
  name,
  email: `${slugify(name)}@example.com`,
  phone: `+234 80${String(10000000 + index * 137).slice(0, 8)}`,
  status: index % 11 === 0 ? 'SUSPENDED' : 'ACTIVE',
  createdAt: daysAgo(120 - index * 4),
  updatedAt: now,
}))

const client = new MongoClient(env.mongoUri)

try {
  await client.connect()
  const db = client.db(env.mongoDbName)
  const products = await db.collection('products').find({}).toArray()

  const brandNames = [...new Set(products.map((product) => product.brand?.name).filter(Boolean))].sort()
  const sellers = brandNames.map((brand, index) => ({
    _id: objectId('sel', index + 1),
    name: `${brand} Official Store`,
    slug: `${slugify(brand)}-official-store`,
    ownerName: `${brand} Retail Partners`,
    email: `${slugify(brand)}@sellers.porsecommerce.test`,
    phone: `+234 81${String(20000000 + index * 211).slice(0, 8)}`,
    status: index % 9 === 4 ? 'PENDING' : index % 13 === 7 ? 'SUSPENDED' : 'ACTIVE',
    commissionRate: 5 + (index % 4),
    rating: 3.8 + (index % 6) * 0.2,
    createdAt: daysAgo(110 - index * 2),
    updatedAt: now,
  }))
  const sellerByBrand = new Map(sellers.map((seller) => [seller.name.replace(' Official Store', ''), seller]))

  const productUpdates = products.map((product, index) => {
    const seller = sellerByBrand.get(product.brand?.name)
    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            sellerId: seller?._id ?? null,
            status: index % 11 === 3 ? 'PENDING' : 'ACTIVE',
            stock: index % 13 === 5 ? 3 : product.stock ?? 10,
            updatedAt: now,
          },
        },
      },
    }
  })

  const orderStatuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'PROCESSING', 'CONFIRMED', 'PENDING', 'CANCELLED', 'RETURNED']
  const orders = Array.from({ length: 90 }, (_, index) => {
    const product = products[(index * 7) % products.length]
    const seller = sellerByBrand.get(product.brand?.name)
    const customer = customers[(index * 5) % customers.length]
    const quantity = 1 + (index % 3)
    const priceCents = product.priceCents ?? 1000
    return {
      _id: objectId('ord', index + 1),
      orderNumber: `PRSC-${String(10001 + index)}`,
      customerId: customer._id,
      sellerId: seller?._id ?? null,
      items: [{ productId: product._id, name: product.name, priceCents, quantity }],
      totalCents: priceCents * quantity + 500,
      status: orderStatuses[index % orderStatuses.length],
      paymentStatus: index % 11 === 6 ? 'FAILED' : index % 7 === 3 ? 'PENDING' : 'PAID',
      createdAt: daysAgo(index % 30),
      updatedAt: now,
    }
  })

  const activities = [
    ['APPROVE', 'seller', sellers[0]?._id, `Approved ${sellers[0]?.name ?? 'seller'}`],
    ['CREATE', 'product', products[0]?._id, `Added ${products[0]?.name ?? 'product'}`],
    ['UPDATE', 'category', null, 'Updated category visibility'],
    ['APPROVE', 'product', products[1]?._id, `Approved ${products[1]?.name ?? 'product'}`],
    ['REJECT', 'seller', sellers.find((seller) => seller.status === 'PENDING')?._id, 'Rejected a seller application'],
  ].map(([action, targetType, targetId, summary], index) => ({
    _id: objectId('act', index + 1),
    adminId: superAdmin._id,
    adminName: superAdmin.name,
    action,
    targetType,
    targetId: targetId ?? null,
    summary,
    createdAt: daysAgo(index),
  }))

  await Promise.all([
    db.collection('admins').deleteMany({}),
    db.collection('sellers').deleteMany({}),
    db.collection('customers').deleteMany({}),
    db.collection('orders').deleteMany({}),
    db.collection('activity_logs').deleteMany({}),
  ])
  await Promise.all([
    db.collection('admins').insertMany(admins),
    db.collection('sellers').insertMany(sellers),
    db.collection('customers').insertMany(customers),
    db.collection('orders').insertMany(orders),
    db.collection('activity_logs').insertMany(activities),
  ])
  if (productUpdates.length) await db.collection('products').bulkWrite(productUpdates)

  await Promise.all([
    db.collection('admins').createIndex({ email: 1 }, { unique: true }),
    db.collection('sellers').createIndex({ slug: 1 }, { unique: true }),
    db.collection('customers').createIndex({ email: 1 }, { unique: true }),
    db.collection('orders').createIndex({ createdAt: -1 }),
    db.collection('orders').createIndex({ customerId: 1 }),
    db.collection('activity_logs').createIndex({ createdAt: -1 }),
  ])

  console.log(`Seeded ${admins.length} admins, ${sellers.length} sellers, ${customers.length} customers, ${orders.length} orders`)
  console.log(`Super admin: ${superAdmin.email}`)
  if (generatedPassword) console.log(`One-time super admin password: ${generatedPassword}`)
} finally {
  await client.close()
}
