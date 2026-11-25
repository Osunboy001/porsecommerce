import { Router } from 'express'
import { requireAuth, requirePermission } from '../../middlewares/auth.middleware.js'
import * as auth from '../../controllers/admin-auth.controller.js'
import { getDashboard, listActivity } from '../../controllers/admin-dashboard.controller.js'
import * as products from '../../controllers/admin-product.controller.js'
import * as categories from '../../controllers/admin-category.controller.js'
import * as sellers from '../../controllers/admin-seller.controller.js'
import * as customers from '../../controllers/admin-customer.controller.js'

const router = Router()

router.post('/auth/login', auth.login)
router.get('/auth/me', requireAuth, auth.me)
router.get('/auth/options', requireAuth, auth.roleOptions)

router.use(requireAuth)

const productRouter = Router()
productRouter.get('/', products.list)
productRouter.get('/:id', products.getOne)
productRouter.post('/', requirePermission('products.manage'), products.create)
productRouter.patch('/:id', requirePermission('products.manage'), products.update)
productRouter.patch('/:id/status', requirePermission('products.manage'), products.setStatus)
productRouter.delete('/:id', requirePermission('products.manage'), products.remove)
router.use('/products', requirePermission('products.view'), productRouter)

const categoryRouter = Router()
categoryRouter.get('/', categories.list)
categoryRouter.get('/:id', categories.getOne)
categoryRouter.post('/', requirePermission('categories.manage'), categories.create)
categoryRouter.patch('/:id', requirePermission('categories.manage'), categories.update)
categoryRouter.delete('/:id', requirePermission('categories.manage'), categories.remove)
router.use('/categories', requirePermission('categories.view'), categoryRouter)

const sellerRouter = Router()
sellerRouter.get('/', sellers.list)
sellerRouter.get('/:id', sellers.getOne)
sellerRouter.post('/', requirePermission('sellers.manage'), sellers.create)
sellerRouter.patch('/:id', requirePermission('sellers.manage'), sellers.update)
router.use('/sellers', requirePermission('sellers.view'), sellerRouter)

const customerRouter = Router()
customerRouter.get('/', customers.list)
customerRouter.get('/:id', customers.getOne)
customerRouter.get('/:id/orders', customers.listOrders)
customerRouter.patch('/:id', requirePermission('customers.manage'), customers.update)
router.use('/customers', requirePermission('customers.view'), customerRouter)

const staffRouter = Router()
staffRouter.get('/', auth.listStaff)
staffRouter.post('/', auth.createStaff)
staffRouter.patch('/:id', auth.updateStaff)
router.use('/staff', requirePermission('staff.manage'), staffRouter)

router.get('/dashboard', requirePermission('dashboard.view'), getDashboard)
router.get('/activity', requirePermission('activity.view'), listActivity)

export default router
