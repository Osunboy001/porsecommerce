import { findActiveCategories } from '../models/category.model.js'

export async function listCategories(_req, res, next) {
  try {
    res.json(await findActiveCategories())
  } catch (error) {
    next(error)
  }
}
