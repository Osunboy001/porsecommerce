import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const here = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(here, '../../.env') })

export const env = {
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/porsecommerce',
  mongoDbName: process.env.MONGODB_DB,
  webUrl: process.env.WEB_URL ?? 'http://localhost:5173',
  port: Number(process.env.PORT ?? 4000),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  adminApiKey: process.env.ADMIN_API_KEY ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  seedAdminEmail: process.env.ADMIN_SEED_EMAIL ?? 'admin@example.com',
  seedAdminPassword: process.env.ADMIN_SEED_PASSWORD ?? '',
}
