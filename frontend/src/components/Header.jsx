import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronRight, Menu, Search, ShoppingBag, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Header({ cartCount, query, onQueryChange, onBagClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!menuOpen) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const desktopLinkClass = ({ isActive }) =>
    `transition hover:text-ink ${isActive ? 'font-semibold text-ink' : 'text-muted'}`

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive ? 'bg-purple-50 text-purple-700' : 'text-ink hover:bg-purple-50'
    }`

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

        <nav className="ml-6 hidden items-center gap-7 text-sm font-medium lg:flex" aria-label="Main navigation">
          {links.slice(1).map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <a href="/admin" className={`${desktopLinkClass({})} font-semibold text-purple-600`}>
            Admin
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <label className="relative hidden sm:block">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              aria-label="Search products"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search products"
              className="h-10 w-44 rounded-full border border-black/[0.08] bg-white pl-10 pr-4 text-sm text-ink placeholder:text-muted/70 transition focus:w-56 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100 xl:w-60 xl:focus:w-72"
            />
          </label>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-purple-50 lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            type="button"
            onClick={onBagClick}
            aria-label={`Bag with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
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
            type="search"
            aria-label="Search products"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search products"
            className="h-10 w-full rounded-full border border-black/[0.08] bg-white pl-10 pr-4 text-sm text-ink placeholder:text-muted/70 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100"
          />
        </label>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile navigation" className="border-t border-black/[0.06] bg-canvas/95 px-5 py-3 sm:px-8 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={mobileLinkClass}
              >
                {link.label}
                <ChevronRight size={16} />
              </NavLink>
            ))}
            <a href="/admin" onClick={() => setMenuOpen(false)} className={`${mobileLinkClass({})} text-purple-700`}>
              Admin
              <ChevronRight size={16} />
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
