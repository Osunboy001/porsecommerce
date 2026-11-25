import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Search } from 'lucide-react'

export default function Categories({ categories, products }) {
  const [filter, setFilter] = useState('')
  const needle = filter.trim().toLowerCase()
  const visible = categories.filter((category) =>
    !needle ||
    category.name.toLowerCase().includes(needle) ||
    category.subcategories.some((item) => item.toLowerCase().includes(needle)),
  )

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-ink">Home</Link>
        <ChevronRight size={13} />
        <span className="font-medium text-ink">Categories</span>
      </nav>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Browse</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">All categories</h1>
          <p className="mt-2 text-sm text-muted">Explore {categories.length} collections and find something you love.</p>
        </div>
        <label className="relative w-full sm:w-72">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            aria-label="Search categories"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search categories"
            className="h-11 w-full rounded-full border border-black/[0.08] bg-white pl-10 pr-4 text-sm text-ink placeholder:text-muted/70 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </label>
      </div>

      {visible.length > 0 ? (
        <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((category) => {
            const count = products.filter((product) => product.categorySlug === category.slug).length
            return (
              <Link
                key={category.id}
                to={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="group rounded-3xl border border-black/[0.06] bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-ink group-hover:text-purple-600">{category.name}</h2>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                      {category.subcategories.join(' · ')}
                    </p>
                  </div>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-purple-500 transition group-hover:translate-x-1" />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                  {count ? `${count} ${count === 1 ? 'product' : 'products'}` : 'Coming soon'}
                </p>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="mt-9 rounded-4xl border border-dashed border-purple-200 bg-white px-6 py-16 text-center">
          <h2 className="font-display text-xl font-bold text-ink">No categories found</h2>
          <p className="mt-2 text-sm text-muted">Try a different search term.</p>
        </div>
      )}
    </main>
  )
}
