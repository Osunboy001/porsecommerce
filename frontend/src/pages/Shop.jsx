import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search, ShoppingBag, X } from 'lucide-react'
import ProductGrid from '../components/ProductGrid'

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
]

export default function Shop({
  products,
  categories,
  query,
  activeCategory,
  onQueryChange,
  onCategoryChange,
  onClearFilters,
  onAdd,
}) {
  const [sort, setSort] = useState('featured')

  const availableCategories = useMemo(() => {
    const slugs = new Set(products.map((product) => product.categorySlug))
    return categories.filter((category) => slugs.has(category.slug))
  }, [categories, products])

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const result = products.filter((product) => {
      const matchesCategory = !activeCategory || product.categorySlug === activeCategory
      const matchesQuery =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle)
      return matchesCategory && matchesQuery
    })

    if (sort === 'price-asc') return [...result].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...result].sort((a, b) => b.price - a.price)
    if (sort === 'rating') return [...result].sort((a, b) => b.rating - a.rating)
    return result
  }, [activeCategory, products, query, sort])

  const activeCategoryName = categories.find((category) => category.slug === activeCategory)?.name

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-ink">Home</Link>
        <ChevronRight size={13} />
        <span className="font-medium text-ink">Shop</span>
      </nav>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">The collection</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {activeCategoryName ?? 'Shop all products'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {query && ` matching “${query}”`}
          </p>
        </div>
        <Link to="/categories" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
          Browse all categories
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-3xl border border-black/[0.06] bg-white p-4 shadow-soft">
        <label className="relative min-w-[12rem] flex-1">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            aria-label="Search products"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search products"
            className="h-11 w-full rounded-full border border-black/[0.08] bg-canvas pl-10 pr-4 text-sm text-ink placeholder:text-muted/70 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="text-xs font-semibold uppercase tracking-wide">Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort products"
            className="h-11 rounded-full border border-black/[0.08] bg-canvas px-4 text-sm font-medium text-ink focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        {(query || activeCategory) && (
          <button type="button" onClick={onClearFilters} className="btn-ghost h-11 text-xs">
            <X size={15} /> Clear filters
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange('')}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            activeCategory
              ? 'border-black/[0.08] bg-white text-muted hover:border-purple-200 hover:text-ink'
              : 'border-purple-600 bg-purple-600 text-white'
          }`}
        >
          All products
        </button>
        {availableCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.slug)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              activeCategory === category.slug
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-black/[0.08] bg-white text-muted hover:border-purple-200 hover:text-ink'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} onAdd={onAdd} />
        ) : (
          <div className="rounded-4xl border border-dashed border-purple-200 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <ShoppingBag size={24} />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold text-ink">No products found</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Try a different category or clear your search to keep exploring.
            </p>
            <button type="button" onClick={onClearFilters} className="btn-primary mt-6">See all products</button>
          </div>
        )}
      </div>
    </main>
  )
}
