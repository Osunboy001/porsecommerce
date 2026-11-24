import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../lib/api'

const views = [
  { label: 'Full view', className: '' },
  { label: 'Close-up', className: 'scale-[1.35]' },
  { label: 'Texture', className: 'scale-[1.7] -rotate-3' },
]

const tabs = ['Details', 'Specifications', 'Shipping & Returns']

export default function ProductDetail({ products, onAdd }) {
  const { slug } = useParams()
  const product = products.find((item) => item.slug === slug)

  const [quantity, setQuantity] = useState(1)
  const [activeView, setActiveView] = useState(0)
  const [activeTab, setActiveTab] = useState('Details')

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Product not found</h1>
        <p className="mt-3 text-sm text-muted">This product may have been moved or renamed.</p>
        <Link to="/" className="btn-primary mt-8">Back to shop</Link>
      </div>
    )
  }

  const related = products.filter((item) => item.slug !== product.slug).slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-ink">Shop</Link>
        <ChevronRight size={13} />
        <Link to={`/?category=${encodeURIComponent(product.category)}`} className="transition hover:text-ink">
          {product.category}
        </Link>
        <ChevronRight size={13} />
        <span className="font-medium text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-purple-600">
              {product.category}
            </span>
            {product.badge && (
              <span className="rounded-full bg-ember-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={index < Math.round(product.rating) ? 'fill-ember-500 text-ember-500' : 'fill-black/10 text-black/10'}
                />
              ))}
            </div>
            <span className="font-accent text-sm font-semibold text-ink">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted">· {product.reviewCount} reviews</span>
          </div>

          <p className="mt-7 font-accent text-3xl font-bold tracking-tight text-ink">
            {formatPrice(product.price)}
          </p>
          <p className="mt-1 text-xs text-muted">Taxes calculated at checkout.</p>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            {product.description}
          </p>

          <div className="my-8 h-px bg-black/[0.07]" />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-full border border-black/10 bg-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-12 w-11 items-center justify-center rounded-full text-ink transition hover:bg-purple-50 disabled:opacity-30"
                disabled={quantity === 1}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-display text-sm font-bold">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                className="flex h-12 w-11 items-center justify-center rounded-full text-ink transition hover:bg-purple-50"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onAdd(product, quantity)}
              className="btn-primary h-12 flex-1 px-8 text-sm"
            >
              <ShoppingBag size={17} /> Add to cart · {formatPrice(product.price * quantity)}
            </button>
          </div>

          <button type="button" className="mt-3 w-full rounded-full py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-50">
            Buy it now
          </button>

          <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, title: 'Free delivery', sub: 'On orders over $100' },
              { icon: RotateCcw, title: 'Easy returns', sub: '30 day window' },
              { icon: ShieldCheck, title: 'Secure checkout', sub: 'Encrypted payment' },
            ].map((perk) => (
              <div key={perk.title} className="rounded-2xl border border-black/[0.06] bg-white p-3.5">
                <perk.icon size={18} className="text-purple-600" />
                <p className="mt-2 text-xs font-bold text-ink">{perk.title}</p>
                <p className="mt-0.5 text-[11px] text-muted">{perk.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-7">
          <div className="relative overflow-hidden rounded-4xl bg-purple-50 shadow-soft">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ember-500/10 blur-3xl" />
            <img
              key={product.slug}
              src={product.image}
              alt={product.name}
              className={`relative aspect-square w-full object-cover transition-transform duration-700 ease-smooth ${views[activeView].className}`}
            />
            <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold text-ink backdrop-blur">
              {views[activeView].label}
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            {views.map((view, index) => (
              <button
                key={view.label}
                type="button"
                onClick={() => setActiveView(index)}
                aria-label={view.label}
                className={`h-20 w-20 overflow-hidden rounded-2xl border-2 bg-purple-50 transition duration-300 sm:h-24 sm:w-24 ${
                  activeView === index ? 'border-purple-500 shadow-lift' : 'border-transparent hover:border-purple-200'
                }`}
              >
                <img src={product.image} alt="" className={`h-full w-full object-cover transition-transform duration-500 ${view.className}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-20 lg:mt-28">
        <div className="flex gap-2 overflow-x-auto border-b border-black/[0.08] pb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-8 max-w-3xl">
          {activeTab === 'Details' && (
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">About this product</h2>
              <p className="mt-4 leading-relaxed text-muted">
                {product.description} Every piece is chosen for the way it feels in everyday use —
                not just how it looks on a shelf.
              </p>
              <ul className="mt-6 space-y-3">
                {product.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-3 text-sm text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'Specifications' && (
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Specifications</h2>
              <dl className="mt-5 divide-y divide-black/[0.07]">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 py-3.5 text-sm">
                    <dt className="text-muted">{spec.label}</dt>
                    <dd className="font-medium text-ink">{spec.value}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-6 py-3.5 text-sm">
                  <dt className="text-muted">SKU</dt>
                  <dd className="font-accent font-medium text-ink">{product.slug.toUpperCase()}</dd>
                </div>
              </dl>
            </div>
          )}

          {activeTab === 'Shipping & Returns' && (
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Shipping & returns</h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
                <p><strong className="text-ink">Delivery:</strong> Free standard delivery on orders over $100. Otherwise $6.99. Most orders arrive in 3–5 business days.</p>
                <p><strong className="text-ink">Returns:</strong> Changed your mind? Send it back within 30 days in its original condition for a full refund.</p>
                <p><strong className="text-ink">Support:</strong> Email hello@porsecommerce.com and we&apos;ll get back to you within one business day.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-20 lg:mt-28">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">You may also like</h2>
          <Link to="/" className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} onAdd={(p) => onAdd(p, 1)} />
          ))}
        </div>
        <Link to="/" className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink">
          <ArrowLeft size={16} /> Back to shop
        </Link>
      </section>
    </div>
  )
}
