import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Bell, CreditCard, Headphones, LayoutDashboard, LogOut, Menu, Megaphone,
  Package, RotateCcw, Search, Settings, ShieldCheck, ShoppingCart, Star, Store,
  Tags, Truck, Users, X, FileText,
} from 'lucide-react'

const groups = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard, enabled: true, permission: 'dashboard.view' }],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Products', path: '/admin/products', icon: Package, enabled: true, permission: 'products.view' },
      { label: 'Categories', path: '/admin/categories', icon: Tags, enabled: true, permission: 'categories.view' },
      { label: 'Sellers', path: '/admin/sellers', icon: Store, enabled: true, permission: 'sellers.view' },
      { label: 'Customers', path: '/admin/customers', icon: Users, enabled: true, permission: 'customers.view' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Orders', path: '/admin/orders', icon: ShoppingCart, phase: 'Phase 2' },
      { label: 'Payments', path: '/admin/payments', icon: CreditCard, phase: 'Phase 2' },
      { label: 'Shipping and Delivery', path: '/admin/shipping', icon: Truck, phase: 'Phase 2' },
      { label: 'Returns and Refunds', path: '/admin/returns', icon: RotateCcw, phase: 'Phase 2' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Promotions', path: '/admin/promotions', icon: Megaphone, phase: 'Phase 3' },
      { label: 'Reviews', path: '/admin/reviews', icon: Star, phase: 'Phase 3' },
      { label: 'Customer Support', path: '/admin/support', icon: Headphones, phase: 'Phase 3' },
      { label: 'Website Content', path: '/admin/content', icon: FileText, phase: 'Phase 3' },
      { label: 'Notifications', path: '/admin/notifications', icon: Bell, phase: 'Phase 3' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Reports and Analytics', path: '/admin/reports', icon: BarChart3, phase: 'Phase 4' },
      { label: 'Staff and Permissions', path: '/admin/staff', icon: ShieldCheck, enabled: true, permission: 'staff.manage' },
      { label: 'Settings', path: '/admin/settings', icon: Settings, phase: 'Phase 4' },
    ],
  },
]

function Sidebar({ admin, onNavigate }) {
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || admin?.role === 'SUPER_ADMIN' || (admin?.permissions ?? []).includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-ink text-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-6">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-600 font-display text-sm font-bold">P</span>
        <div>
          <p className="font-display text-sm font-bold leading-tight">Porse Marketplace</p>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Admin console</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const content = (
                  <>
                    <Icon size={16} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {!item.enabled && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-white/40">Soon</span>}
                  </>
                )
                return item.enabled ? (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={onNavigate}
                    className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${isActive ? 'bg-purple-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    {content}
                  </NavLink>
                ) : (
                  <div key={item.label} className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/35" title={`${item.phase} feature`}>
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link to="/" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-white/60 transition hover:bg-white/5 hover:text-white">
          View storefront
        </Link>
      </div>
    </aside>
  )
}

export default function AdminLayout({ admin, onLogout, children }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const current = groups.flatMap((group) => group.items).find((item) => item.path === location.pathname)
  const title = current?.label ?? 'Dashboard'

  function submitSearch(event) {
    event.preventDefault()
    navigate(`/admin/products?q=${encodeURIComponent(search)}`)
    setOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-canvas font-sans">
      <div className="hidden lg:block"><Sidebar admin={admin} /></div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0"><Sidebar admin={admin} onNavigate={() => setOpen(false)} /></div>
          <button onClick={() => setOpen(false)} className="absolute left-64 top-4 rounded-lg bg-white p-2 text-ink" aria-label="Close menu"><X size={18} /></button>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-black/5 bg-white/95 px-4 backdrop-blur sm:px-7">
          <button onClick={() => setOpen(true)} className="rounded-xl p-2 text-ink hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Menu size={20} /></button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-bold text-ink sm:text-lg">{title}</h1>
            <p className="hidden text-xs text-muted sm:block">Manage your marketplace from one place</p>
          </div>
          <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-black/10 bg-canvas px-3 py-2 md:flex">
            <Search size={16} className="text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </form>
          <button onClick={() => navigate('/admin/notifications')} className="relative rounded-xl p-2 text-muted hover:bg-slate-100 hover:text-ink" aria-label="Notifications">
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ember-500" />
          </button>
          <div className="flex items-center gap-2 border-l border-black/10 pl-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">{admin.name.charAt(0)}</span>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-ink">{admin.name}</p>
              <p className="text-[10px] text-muted">{admin.role.replace('_', ' ')}</p>
            </div>
            <button onClick={onLogout} className="ml-1 rounded-lg p-2 text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Sign out"><LogOut size={17} /></button>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8">{children}</div>
      </main>
    </div>
  )
}
