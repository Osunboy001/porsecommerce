import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import CartDrawer from './components/CartDrawer'
import Header from './components/Header'
import SiteFooter from './components/SiteFooter'
import About from './pages/About'
import Categories from './pages/Categories'
import Contact from './pages/Contact'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ProductDetail from './pages/ProductDetail'
import Shop from './pages/Shop'
import { formatPrice, getCategories, getProducts } from './lib/api'
import { readFilters, writeFilters } from './lib/filters'

const CART_STORAGE_KEY = 'porsecommerce-cart'

function readStoredCart() {
  if (typeof window === 'undefined') return []

  try {
    const saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(saved)) return []

    return saved
      .filter((item) => item && typeof item.slug === 'string' && Number.isFinite(item.price))
      .map((item) => ({
        ...item,
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      }))
  } catch {
    return []
  }
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { q: query, category: activeCategory } = readFilters(searchParams)

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cartItems, setCartItems] = useState(readStoredCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    let cancelled = false
    Promise.all([getCategories(), getProducts()])
      .then(([categoryData, productData]) => {
        if (cancelled) return
        setCategories(categoryData)
        setProducts(productData)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch {}
  }, [cartItems])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  function showToast(message) {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }

  const closeCart = useCallback(() => setCartOpen(false), [])

  function addToCart(product, quantity = 1) {
    const amount = Math.max(1, Math.floor(quantity))
    const item = {
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: amount,
    }

    setCartItems((current) => {
      const existing = current.find((entry) => entry.slug === item.slug)
      if (existing) {
        return current.map((entry) =>
          entry.slug === item.slug ? { ...entry, ...item, quantity: entry.quantity + amount } : entry,
        )
      }
      return [...current, item]
    })

    showToast(
      `${amount > 1 ? `${amount} × ` : ''}${product.name} added to bag · ${formatPrice(product.price * amount)}`,
    )
  }

  function changeCartQuantity(slug, quantity) {
    const nextQuantity = Math.max(1, Math.floor(quantity))
    setCartItems((current) =>
      current.map((item) => (item.slug === slug ? { ...item, quantity: nextQuantity } : item)),
    )
  }

  function removeFromCart(slug) {
    setCartItems((current) => current.filter((item) => item.slug !== slug))
    showToast('Removed from bag')
  }

  function handleCheckout() {
    showToast('Checkout is not connected yet — your bag is saved.')
  }

  function handleQueryChange(value) {
    const pathname = location.pathname === '/' || location.pathname === '/shop' ? location.pathname : '/shop'
    navigate(
      { pathname, search: writeFilters(searchParams, { q: value }) },
      { replace: true },
    )
  }

  function handleCategoryChange(slug) {
    navigate({ pathname: '/shop', search: writeFilters(searchParams, { category: slug }) })
  }

  function clearFilters() {
    navigate({ pathname: location.pathname, search: '' }, { replace: true })
  }

  const pageProps = {
    products,
    categories,
    query,
    activeCategory,
    onAdd: addToCart,
    onClearFilters: clearFilters,
  }

  return (
    <div id="top" className="min-h-screen bg-canvas">
      <div className="bg-ink px-5 py-2 text-center text-xs font-medium text-white sm:text-sm">
        <p>
          Free shipping on orders over $100 · New arrivals every week ·{' '}
          <Link to="/shop" className="font-semibold text-ember-300 underline-offset-2 hover:underline">Shop now</Link>
        </p>
      </div>

      <Header
        cartCount={cartCount}
        query={query}
        onQueryChange={handleQueryChange}
        onBagClick={() => setCartOpen(true)}
      />

      {loading ? (
        <main className="mx-auto max-w-7xl px-5 py-24 text-center text-sm text-muted">Loading shop…</main>
      ) : error ? (
        <main className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Couldn’t load the shop</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </main>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <Home
                {...pageProps}
                onCategorySelect={handleCategoryChange}
                onNewsletterSubmit={(email) => showToast(`Thanks! ${email} has been subscribed.`)}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <Shop
                {...pageProps}
                onQueryChange={handleQueryChange}
                onCategoryChange={handleCategoryChange}
              />
            }
          />
          <Route path="/categories" element={<Categories categories={categories} products={products} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact onSubmit={showToast} />} />
          <Route path="/product/:slug" element={<ProductDetail products={products} onAdd={addToCart} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}

      <SiteFooter />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={closeCart}
        onQuantityChange={changeCartQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-[toast_.3s_cubic-bezier(0.22,1,0.36,1)]"
        >
          <div className="flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-lift">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ember-500 text-white">
              <Check size={12} strokeWidth={3} />
            </span>
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
