import { Link } from 'react-router-dom'
import { Plus, Star } from 'lucide-react'
import { formatPrice } from '../lib/api'

const badgeStyles = {
  New: 'bg-purple-600 text-white',
  Bestseller: 'bg-ink text-white',
  Limited: 'bg-ember-500 text-white',
}

export default function ProductCard({ product, onAdd }) {
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-4xl bg-purple-50 shadow-soft">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.06]"
          />
        </Link>

        {product.badge && (
          <span
            className={`pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${badgeStyles[product.badge]}`}
          >
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to bag`}
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-soft backdrop-blur transition duration-300 ease-smooth hover:bg-ink hover:text-white active:scale-95"
        >
          <Plus size={19} strokeWidth={2.2} />
        </button>
      </div>

      <div className="px-1 pt-4">
        <Link to={`/product/${product.slug}`} className="block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-500">
            {product.category}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink transition group-hover:text-purple-600">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <Star size={13} className="fill-ember-500 text-ember-500" />
          <span className="font-accent font-semibold text-ink">{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
        </div>

        <p className="mt-2 line-clamp-1 text-sm text-muted">{product.description}</p>
        <p className="mt-3 font-accent text-base font-bold text-ink">{formatPrice(product.price)}</p>
      </div>
    </article>
  )
}
