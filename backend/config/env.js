import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

// Root .env sits two levels above backend/config
const here = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(here, '../../.env') })

export const env = {
  mongoUri: process.env.MONGODB_URI,
  webUrl: process.env.WEB_URL ?? 'http://localhost:5173',
  port: Number(process.env.PORT ?? 4000),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  adminApiKey: process.env.ADMIN_API_KEY ?? '',
}

if (!env.mongoUri) {
  throw new Error('MONGODB_URI is missing. Add it to the root .env file.')
}
