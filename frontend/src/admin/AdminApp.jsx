import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { adminFetch, clearToken, getToken } from './lib/api'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Sellers from './pages/Sellers'
import Customers from './pages/Customers'
import Staff from './pages/Staff'
import Placeholder from './pages/Placeholder'

const planned = {
  orders: ['Orders', 'Phase 2', ['View all orders', 'Search and filter', 'Order details', 'Update order status', 'Handle disputes']],
  payments: ['Payments', 'Phase 2', ['Transactions', 'Failed payments', 'Refunds', 'Seller payouts', 'Commission reports']],
  shipping: ['Shipping and Delivery', 'Phase 2', ['Delivery records', 'Delivery partners', 'Track shipments', 'Delivery fees']],
  returns: ['Returns and Refunds', 'Phase 2', ['Return requests', 'Approve or reject', 'Refund tracking', 'Returned inventory']],
  promotions: ['Promotions', 'Phase 3', ['Flash sales', 'Discount campaigns', 'Coupon codes', 'Banners', 'Featured products']],
  reviews: ['Reviews', 'Phase 3', ['Customer reviews', 'Product ratings', 'Reported reviews', 'Seller ratings']],
  support: ['Customer Support', 'Phase 3', ['Support tickets', 'Assign to staff', 'Respond to enquiries', 'Resolve complaints']],
  content: ['Website Content', 'Phase 3', ['Homepage banners', 'Featured products', 'FAQs', 'Blog content']],
  notifications: ['Notifications', 'Phase 3', ['Customer announcements', 'Seller notices', 'Approval updates', 'Platform alerts']],
  reports: ['Reports and Analytics', 'Phase 4', ['Revenue reports', 'Sales reports', 'Seller performance', 'Exportable reports']],
  settings: ['Settings', 'Phase 4', ['Site identity', 'Commission settings', 'Payment gateway', 'Shipping and tax', 'Security']],
}

export default function AdminApp() {
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setChecking(false)
      return
    }
    adminFetch('/auth/me')
      .then((data) => setAdmin(data.admin))
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  function logout() {
    clearToken()
    setAdmin(null)
  }

  if (checking) {
    return <div className="admin-app grid min-h-screen place-items-center bg-canvas text-sm font-medium text-muted">Checking admin session…</div>
  }

  return (
    <div className="admin-app">
      <Routes>
      <Route path="login" element={admin ? <Navigate to="/admin" replace /> : <Login onLogin={setAdmin} />} />
      <Route
        path="*"
        element={admin ? (
          <AdminLayout admin={admin} onLogout={logout}>
            <Routes>
              <Route path="" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="sellers" element={<Sellers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="staff" element={<Staff />} />
              {Object.entries(planned).map(([path, [title, phase, features]]) => (
                <Route key={path} path={path} element={<Placeholder title={title} phase={phase} features={features} />} />
              ))}
              <Route path="*" element={<Placeholder title="Page not found" phase="Phase 1" features={['Return to the dashboard to continue']} />} />
            </Routes>
          </AdminLayout>
        ) : <Navigate to="/admin/login" replace />}
      />
      </Routes>
    </div>
  )
}
