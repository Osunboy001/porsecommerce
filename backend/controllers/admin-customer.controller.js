import { z } from 'zod'
import { findCustomerById, listCustomerOrders, listCustomers, updateCustomer } from '../models/customer.model.js'
import { logActivity } from '../models/activity.model.js'
import { parse } from '../lib/validate.js'
import { httpError } from '../lib/http-error.js'

const updateSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

function handle(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res)
    } catch (error) {
      next(error)
    }
  }
}

export const list = handle(async (req, res) => {
  const search = typeof req.query.search === 'string' && req.query.search.trim() ? req.query.search.trim() : undefined
  const status = typeof req.query.status === 'string' ? req.query.status : undefined
  res.json(await listCustomers({ search, status }))
})

export const getOne = handle(async (req, res) => {
  const customer = await findCustomerById(req.params.id)
  if (!customer) throw httpError(404, 'Customer not found')
  res.json(customer)
})

export const listOrders = handle(async (req, res) => {
  res.json(await listCustomerOrders(req.params.id))
})

export const update = handle(async (req, res) => {
  const data = parse(updateSchema, req.body ?? {})
  const customer = await updateCustomer(req.params.id, data)
  if (!customer) throw httpError(404, 'Customer not found')
  await logActivity({
    admin: req.admin,
    action: data.status === 'SUSPENDED' ? 'REJECT' : 'APPROVE',
    targetType: 'customer',
    targetId: customer.id,
    summary: `Set customer ${customer.email} to ${customer.status}`,
  })
  res.json(customer)
})
