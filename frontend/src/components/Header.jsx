import { Link } from 'react-router-dom'
import { Search, ShoppingBag, Menu } from 'lucide-react'

export default function Header({ cartCount, query, onQueryChange, onBagClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="porsecommerce home">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 font-display text-lg font-extrabold text-white shadow-lift">
            p
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-ember-500" />
          </span>
          <span className="font-display text-[17px] font-extrabold tracking-tight text-ink">
            porse<span className="text-purple-600">commerce</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-7 text-sm font-medium text-muted lg:flex">
          <Link to="/" className="transition hover:text-ink">Shop</Link>
          <a href="#categories" className="transition hover:text-ink">Categories</a>
          <a href="#about" className="transition hover:text-ink">About</a>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <label className="relative hidden sm:block">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search products"
              className="h-10 w-44 rounded-full border border-black/[0.08] bg-white pl-10 pr-4 text-sm text-ink placeholder:text-muted/70 transition focus:w-56 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100 xl:w-60 xl:focus:w-72"
            />
          </label>

          <button
            type="button"
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-purple-50 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            onClick={onBagClick}
            aria-label={`Bag with ${cartCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition duration-300 ease-smooth hover:bg-purple-600 active:scale-95"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-5 pb-3 sm:hidden">
        <label className="relative block">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search products"
            className="h-10 w-full rounded-full border border-black/[0.08] bg-white pl-10 pr-4 text-sm text-ink placeholder:text-muted/70 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </label>
      </div>
    </header>
  )
}
