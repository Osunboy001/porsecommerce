import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-black/5 bg-white shadow-soft ${className}`}>{children}</div>
}

const badgeTones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
}

export function Badge({ children, tone = 'slate' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${badgeTones[tone] ?? badgeTones.slate}`}>{children}</span>
}

export function statusTone(status) {
  if (['ACTIVE', 'DELIVERED', 'PAID', 'APPROVED'].includes(status)) return 'green'
  if (['PENDING', 'PROCESSING', 'SHIPPED', 'CONFIRMED'].includes(status)) return 'amber'
  if (['SUSPENDED', 'REJECTED', 'CANCELLED', 'FAILED', 'ARCHIVED', 'RETURNED'].includes(status)) return 'red'
  return 'slate'
}

const statTones = {
  purple: 'bg-purple-50 text-purple-700',
  ember: 'bg-ember-50 text-ember-700',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  slate: 'bg-slate-100 text-slate-700',
  red: 'bg-rose-50 text-rose-700',
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'purple' }) {
  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        {Icon && <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${statTones[tone] ?? statTones.purple}`}><Icon size={19} /></span>}
      </div>
    </Card>
  )
}

export function Button({ variant = 'primary', size = 'md', icon: Icon, children, className = '', ...props }) {
  const variants = {
    primary: 'bg-ink text-white hover:bg-purple-700',
    secondary: 'border border-black/10 bg-white text-ink hover:border-purple-300 hover:bg-purple-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-muted hover:bg-slate-100 hover:text-ink',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm' }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}

export function Field({ label, children, hint, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  )
}

export const inputClass = 'w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'

export function Modal({ title, subtitle, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-lift ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-black/5 px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function DataTable({ columns, rows, empty = 'No records found' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-black/5 text-[11px] uppercase tracking-wide text-muted">
            {columns.map((column) => <th key={column.key} className={`px-5 py-3 font-semibold ${column.className ?? ''}`}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-muted">{empty}</td></tr>
          )}
          {rows.map((row, index) => (
            <tr key={row.id ?? index} className="border-b border-black/5 last:border-0 hover:bg-slate-50/80">
              {columns.map((column) => <td key={column.key} className={`px-5 py-3.5 align-middle ${column.className ?? ''}`}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(onClose, 3000)
    return () => window.clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null
  return (
    <div role="status" className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white shadow-lift">
      <CheckCircle2 size={17} className="text-emerald-400" />
      {message}
    </div>
  )
}
