import { findActiveProductBySlug, findActiveProducts } from '../models/product.model.js'

export async function listProducts(req, res, next) {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined
    res.json(await findActiveProducts({ category }))
  } catch (error) {
    next(error)
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const product = await findActiveProductBySlug(req.params.slug)
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json(product)
  } catch (error) {
    next(error)
  }
}
