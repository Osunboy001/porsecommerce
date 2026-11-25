import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Clock3,
  Mail,
  Quote,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import ProductGrid from '../components/ProductGrid'

const testimonials = [
  {
    name: 'Amina K.',
    role: 'Verified buyer',
    quote: 'The quality felt premium right out of the box. Delivery was fast and the packaging was beautiful.',
    rating: 5,
  },
  {
    name: 'Daniel O.',
    role: 'Repeat customer',
    quote: 'I love how easy it is to browse categories and find exactly what I need. Checkout was smooth too.',
    rating: 5,
  },
  {
    name: 'Sophia R.',
    role: 'Home decor shopper',
    quote: 'Great selection, fair prices, and the products look even better in person. I’ll definitely shop again.',
    rating: 5,
  },
]

export default function Home({
  products,
  categories,
  query,
  activeCategory,
  onCategorySelect,
  onClearFilters,
  onAdd,
  onNewsletterSubmit,
}) {
  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = !activeCategory || product.categorySlug === activeCategory
      const matchesQuery =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle)
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, products, query])

  const bestSellers = products.filter((p) => p.badge === 'Bestseller' || p.rating >= 4.8).slice(0, 4)
  const newArrivals = products.filter((p) => p.badge === 'New').slice(0, 4)

  return (
    <main>
      <HeroSection />
      <CategoriesSection
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={onCategorySelect}
      />
      <FeaturedProductsSection
        products={filteredProducts.slice(0, 8)}
        query={query}
        activeCategory={activeCategory}
        totalCount={filteredProducts.length}
        onClearFilters={onClearFilters}
        onAdd={onAdd}
      />
      <PromotionalBanner />
      <ProductCollectionSection
        id="best-sellers"
        eyebrow="Top picks"
        title="Best Sellers"
        description="Customer favorites that keep flying off the shelves."
        products={bestSellers.length ? bestSellers : products.slice(0, 4)}
        onAdd={onAdd}
      />
      <ProductCollectionSection
        id="new-arrivals"
        eyebrow="Just in"
        title="New Arrivals"
        description="Fresh finds, recently added to the collection."
        products={newArrivals.length ? newArrivals : products.slice(2, 6)}
        onAdd={onAdd}
        tone="soft"
      />
      <WhyShopWithUs />
      <TestimonialsSection />
      <NewsletterSection onSubmit={onNewsletterSubmit} />
    </main>
  )
}

function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-10">
      <div className="hero-glow relative overflow-hidden rounded-4xl px-7 py-16 text-white shadow-lift sm:px-14 sm:py-24">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 hidden h-40 w-40 rounded-full bg-white/10 blur-2xl lg:block" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur">
            <Sparkles size={14} className="text-ember-300" />
            Your everyday shopping destination
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-7xl">
            Shop smarter.
            <br />
            <span className="text-ember-300">Live better.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            Discover quality products across tech, fashion, home, and more — all curated for modern living.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-ink transition duration-300 ease-smooth hover:bg-ember-500 hover:text-white active:scale-[0.98]">
              Shop featured <ArrowRight size={17} />
            </Link>
            <Link to="/categories" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Browse categories
            </Link>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-left">
            {[['50+', 'Categories'], ['Fast', 'Delivery'], ['Secure', 'Checkout']].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-xl font-bold text-white sm:text-2xl">{value}</p>
                <p className="text-xs text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoriesSection({ categories, activeCategory, onCategorySelect }) {
  return (
    <section id="categories" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Browse</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Shop by Categories</h2>
          <p className="mt-2 text-sm text-muted">Find what you love across our wide range of collections.</p>
        </div>
        <span className="rounded-full bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700">{categories.length} categories</span>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.slice(0, 12).map((category, index) => {
          const isActive = activeCategory === category.slug
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategorySelect(category.slug)}
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
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{category.subcategories.join(' · ')}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Link to="/categories" className="btn-ghost">
          View all {categories.length} categories
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

function FeaturedProductsSection({ products, query, activeCategory, totalCount, onClearFilters, onAdd }) {
  const categoryName = activeCategory.replace(/-/g, ' ')

  return (
    <section id="featured-products" className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-16 sm:px-8 sm:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Selected for you</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {activeCategory ? categoryName : 'Featured Products'}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {totalCount} {totalCount === 1 ? 'product' : 'products'}
            {query && ` matching “${query}”`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(activeCategory || query) && (
            <button type="button" onClick={onClearFilters} className="btn-ghost text-xs">Clear filter</button>
          )}
          <Link to="/shop" className="text-sm font-semibold text-purple-600 hover:text-purple-700">View all</Link>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="mt-9">
          <ProductGrid products={products} onAdd={onAdd} />
        </div>
      ) : (
        <div className="mt-9 rounded-4xl border border-dashed border-purple-200 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <ShoppingBag size={24} />
          </span>
          <h3 className="mt-5 font-display text-xl font-bold text-ink">No products found</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Try a different category or clear your search to keep exploring.
          </p>
          <button type="button" onClick={onClearFilters} className="btn-primary mt-6">See all products</button>
        </div>
      )}
    </section>
  )
}

function PromotionalBanner() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
      <div className="relative overflow-hidden rounded-4xl bg-purple-700 px-7 py-12 text-white sm:px-12 sm:py-16">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-ember-500/20 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-300">Limited time offer</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Up to 30% off selected essentials</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
              Refresh your space, upgrade your gear, and grab your favorites before the deals are gone.
            </p>
          </div>
          <Link to="/shop" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-ink transition duration-300 hover:bg-ember-500 hover:text-white">
            Shop deals <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProductCollectionSection({ id, eyebrow, title, description, products, onAdd, tone = 'default' }) {
  return (
    <section id={id} className={`scroll-mt-28 px-5 py-16 sm:px-8 sm:py-24 ${tone === 'soft' ? 'bg-white' : ''}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">{eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-purple-600 transition hover:text-purple-700">View all</Link>
        </div>
        <div className="mt-9">
          <ProductGrid products={products} onAdd={onAdd} />
        </div>
      </div>
    </section>
  )
}

function WhyShopWithUs() {
  const features = [
    { icon: Truck, title: 'Fast Delivery', description: 'Reliable shipping that gets your order to your door quickly.' },
    { icon: ShieldCheck, title: 'Secure Payments', description: 'Your transactions are protected with trusted, encrypted checkout.' },
    { icon: Star, title: 'Quality Products', description: 'Carefully selected items that meet our quality standards.' },
    { icon: Clock3, title: '24/7 Support', description: 'Friendly help whenever you need it, day or night.' },
  ]

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Our promise</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Why Shop With Us</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">We make online shopping simple, secure, and satisfying from browse to delivery.</p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <feature.icon size={22} />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-ink">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Testimonials</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">What Customers Say</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">Real feedback from shoppers who love buying with porsecommerce.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-3xl border border-black/[0.06] bg-canvas p-6 shadow-soft">
              <Quote size={20} className="text-purple-500" />
              <div className="mt-4 flex gap-1">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} size={15} className="fill-ember-500 text-ember-500" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">“{item.quote}”</p>
              <div className="mt-6">
                <p className="font-display text-sm font-bold text-ink">{item.name}</p>
                <p className="text-xs text-muted">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection({ onSubmit }) {
  const [email, setEmail] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const value = email.trim()
    if (!value) return
    onSubmit(value)
    setEmail('')
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="relative overflow-hidden rounded-4xl bg-ink px-7 py-12 text-white sm:px-12 sm:py-16">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-300">Newsletter</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Join our newsletter</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
              Get exclusive offers, new arrival alerts, and style inspiration delivered to your inbox.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                aria-label="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="h-12 w-full rounded-full border border-white/10 bg-white pl-11 pr-4 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-4 focus:ring-purple-300/30"
              />
            </label>
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ember-500 px-6 text-sm font-semibold text-white transition hover:bg-ember-400 active:scale-[0.98]">
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
