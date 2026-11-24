import { useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, ShoppingBag, Sparkles } from 'lucide-react'
import Header from './components/Header'
import ProductCard from './components/ProductCard'
import ProductDetail from './pages/ProductDetail'
import { formatPrice, getCategories, getProducts } from './lib/api'

export default function App() {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [toast, setToast] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  // Allow links like /?category=Lighting to preselect a category
  useEffect(() => {
    const category = new URLSearchParams(location.search).get('category')
    if (category) setActiveCategory(category)
  }, [location.search])

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = !activeCategory || product.category === activeCategory
      const matchesQuery =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle)
      return matchesCategory && matchesQuery
    })
  }, [query, activeCategory, products])

  function addToCart(product, quantity = 1) {
    setCartCount((count) => count + quantity)
    setToast(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to bag · ${formatPrice(product.price * quantity)}`)
    window.setTimeout(() => setToast(null), 2600)
  }

  function handleCategorySelect(name) {
    setActiveCategory((current) => (current === name ? null : name))
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div id="top" className="min-h-screen">
      <Header
        cartCount={cartCount}
        query={query}
        onQueryChange={setQuery}
        onBagClick={() => setToast(cartCount ? `${cartCount} item(s) in your bag` : 'Your bag is empty')}
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
              <ShopPage
                products={products}
                categories={categories}
                query={query}
                activeCategory={activeCategory}
                showAllCategories={showAllCategories}
                filteredProducts={filteredProducts}
                onCategorySelect={handleCategorySelect}
                onToggleAllCategories={() => setShowAllCategories((value) => !value)}
                onClearFilters={() => { setActiveCategory(null); setQuery('') }}
                onAdd={addToCart}
              />
            }
          />
          <Route path="/product/:slug" element={<ProductDetail products={products} onAdd={addToCart} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}

      <footer id="about" className="border-t border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 text-center sm:flex-row sm:px-8 sm:text-left">
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight text-ink">
              porse<span className="text-purple-600">commerce</span>
            </p>
            <p className="mt-1 text-xs text-muted">Considered things for everyday living.</p>
          </div>
          <p className="text-xs text-muted">© {new Date().getFullYear()} porsecommerce. All rights reserved.</p>
        </div>
      </footer>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[toast_.3s_cubic-bezier(0.22,1,0.36,1)]">
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

function ShopPage({
  products,
  categories,
  query,
  activeCategory,
  showAllCategories,
  filteredProducts,
  onCategorySelect,
  onToggleAllCategories,
  onClearFilters,
  onAdd,
}) {
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 12)

  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-10">
        <div className="hero-glow relative overflow-hidden rounded-4xl px-7 py-16 text-white shadow-lift sm:px-14 sm:py-24">
          <div className="absolute right-0 top-0 h-24 w-24 bg-ember-500" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur">
              <Sparkles size={14} className="text-ember-300" />
              50 categories. One good store.
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-7xl">
              Everything you
              <br />
              <span className="text-ember-300">actually want.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
              Tech, style, home, and the little things in between — picked with care and delivered with ease.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#categories" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-ink transition duration-300 ease-smooth hover:bg-ember-500 hover:text-white active:scale-[0.98]">
                Explore categories <ArrowRight size={17} />
              </a>
              <a href="#products" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Featured picks
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Browse</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Shop by category
            </h2>
            <p className="mt-2 text-sm text-muted">From smartphones to Sunday morning coffee — we&apos;ve got a place for it.</p>
          </div>
          <span className="rounded-full bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700">
            {categories.length} categories
          </span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleCategories.map((category, index) => {
            const isActive = activeCategory === category.name
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategorySelect(category.name)}
                className={`group rounded-3xl border p-4 text-left transition duration-300 ease-smooth sm:p-5 ${
                  isActive
                    ? 'border-purple-400 bg-purple-50 shadow-lift'
                    : 'border-black/[0.06] bg-white shadow-soft hover:-translate-y-1 hover:border-purple-200 hover:shadow-lift'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl font-accent text-xs font-bold ${isActive ? 'bg-purple-600 text-white' : 'bg-canvas text-purple-600 group-hover:bg-purple-100'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {isActive && <Check size={16} className="text-purple-600" />}
                </div>
                <h3 className="mt-4 font-display text-sm font-bold leading-tight text-ink sm:text-base">{category.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
                  {category.subcategories.join(' · ')}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button type="button" onClick={onToggleAllCategories} className="btn-ghost">
            {showAllCategories ? 'Show fewer categories' : `View all ${categories.length} categories`}
            <ChevronDown size={16} className={`transition-transform duration-300 ${showAllCategories ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Selected for you</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {activeCategory ?? 'Featured picks'}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {query && ` matching “${query}”`}
            </p>
          </div>

          {activeCategory && (
            <button type="button" onClick={onClearFilters} className="btn-ghost text-xs">Clear filter</button>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        ) : (
          <div className="mt-9 rounded-4xl border border-dashed border-purple-200 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <ShoppingBag size={24} />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-ink">Nothing here yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              We&apos;re still adding products to {activeCategory ?? 'the catalog'}. Pick another category or clear your search to keep exploring.
            </p>
            <button type="button" onClick={onClearFilters} className="btn-primary mt-6">See all products</button>
          </div>
        )}
      </section>
    </main>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-5xl font-extrabold text-ink">404</h1>
      <p className="mt-3 text-sm text-muted">That page doesn&apos;t exist.</p>
    </div>
  )
}
