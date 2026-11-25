import { Link } from 'react-router-dom'
import { CreditCard } from 'lucide-react'

const columns = [
  {
    title: 'About',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Story', to: '/about' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/contact' },
      { label: 'Help', to: '/contact' },
    ],
  },
  {
    title: 'Shopping',
    links: [
      { label: 'Shop', to: '/shop' },
      { label: 'Categories', to: '/categories' },
      { label: 'Best Sellers', to: '/shop' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Privacy', to: '/contact' },
      { label: 'Terms', to: '/contact' },
      { label: 'Returns', to: '/contact' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/[0.06] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10">
          <p className="font-display text-lg font-extrabold tracking-tight text-ink">
            porse<span className="text-purple-600">commerce</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted">Considered things for everyday living. Quality products, thoughtfully curated.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink">{column.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition hover:text-ink">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink">Social Media</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="transition hover:text-ink">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition hover:text-ink">Instagram</a></li>
              <li><a href="https://x.com" target="_blank" rel="noreferrer" className="transition hover:text-ink">X</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink">Contact</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li><a href="mailto:hello@porsecommerce.com" className="transition hover:text-ink">Email</a></li>
              <li><a href="tel:+15551234567" className="transition hover:text-ink">Phone</a></li>
              <li><span>123 Market Street, Lagos</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] pt-6 sm:flex-row">
          <p className="text-xs text-muted">© {new Date().getFullYear()} porsecommerce. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-muted">
            <CreditCard size={14} />
            <span>Secure payments</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
