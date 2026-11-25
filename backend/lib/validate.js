import { ZodError } from 'zod'
import { httpError } from './http-error.js'

export function parse(schema, data) {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw httpError(400, error.issues[0]?.message ?? 'Invalid request')
    }
    throw error
  }
}
