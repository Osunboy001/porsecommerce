import app from './app.js'
import { env } from './config/env.js'
import { prisma } from './db/client.js'

try {
  await prisma.$connect()
  console.log('MongoDB connected')
} catch (error) {
  console.error('MongoDB connection failed:', error.message)
  process.exit(1)
}

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`)
})
