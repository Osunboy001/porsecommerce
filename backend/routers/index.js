import { Router } from 'express'
import healthRouter from './health.router.js'
import categoryRouter from './category.router.js'
import productRouter from './product.router.js'
import adminRouter from './admin/index.js'

const router = Router()

router.use('/health', healthRouter)
router.use('/categories', categoryRouter)
router.use('/products', productRouter)
router.use('/admin', adminRouter)

export default router
