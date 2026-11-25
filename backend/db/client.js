import { MongoClient } from 'mongodb'
import { env } from '../config/env.js'

const client = new MongoClient(env.mongoUri)
let connection = null

export async function connectToDatabase() {
  if (!connection) {
    connection = client
      .connect()
      .then(() => client.db(env.mongoDbName))
      .catch((error) => {
        connection = null
        throw error
      })
  }

  return connection
}

export async function getDb() {
  return connectToDatabase()
}

export async function closeDatabase() {
  if (!connection) return

  try {
    await connection
  } catch {}

  await client.close()
  connection = null
}
