import app from './app.js'
import { env } from './config/env.js'
import { closeDatabase, connectToDatabase } from './db/client.js'

try {
  await connectToDatabase()
  console.log('MongoDB connected')
} catch (error) {
  console.error('MongoDB connection failed:', error.message)
  process.exit(1)
}

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`)
})

function shutdown() {
  server.close(async () => {
    await closeDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
