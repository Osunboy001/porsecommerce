import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle, ArrowUpRight, Boxes, CheckCircle2, Clock, CreditCard, Package,
  ShoppingCart, Store, Users, Wallet, XCircle,
} from 'lucide-react'
import { adminFetch, formatDate, formatMoney, formatNumber } from '../lib/api'
import { Badge, Card, StatCard } from '../components/ui'
import { BarChart, DonutChart, LineChart, Panel, ProgressBar } from '../components/charts'

const ranges = [
  ['today', 'Today'],
  ['7d', '7 days'],
  ['30d', '30 days'],
  ['month', 'This month'],
  ['all', 'All time'],
]

function ActivityIcon({ action }) {
  if (action === 'APPROVE') return <CheckCircle2 size={14} className="text-emerald-600" />
  if (action === 'REJECT') return <XCircle size={14} className="text-rose-600" />
  if (action === 'DELETE') return <AlertTriangle size={14} className="text-rose-600" />
  return <ArrowUpRight size={14} className="text-purple-600" />
}

export default function Dashboard() {
  const [range, setRange] = useState('7d')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ range })
      if (range === 'custom') {
        if (from) params.set('from', from)
        if (to) params.set('to', to)
      }
      setData(await adminFetch(`/dashboard?${params}`))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [range, from, to])

  useEffect(() => { load() }, [load])

  const stats = data?.stats ?? {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Dashboard overview</h2>
          <p className="mt-1 text-sm text-muted">Marketplace performance and pending work at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-xl border border-black/5 bg-white p-1 shadow-soft">
            {ranges.map(([value, label]) => (
              <button key={value} onClick={() => setRange(value)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${range === value ? 'bg-ink text-white' : 'text-muted hover:bg-slate-100 hover:text-ink'}`}>{label}</button>
            ))}
          </div>
          <button onClick={() => setRange('custom')} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${range === 'custom' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-black/5 bg-white text-muted hover:text-ink'}`}>Custom</button>
          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
              <span className="text-muted">—</span>
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs" />
            </div>
          )}
        </div>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={loading ? '…' : formatMoney(stats.totalRevenue)} hint="Excludes cancelled orders" icon={Wallet} tone="purple" />
        <StatCard label="Total orders" value={loading ? '…' : formatNumber(stats.totalOrders)} hint={`${stats.pendingOrders ?? 0} awaiting action`} icon={ShoppingCart} tone="ember" />
        <StatCard label="Customers" value={loading ? '…' : formatNumber(stats.totalCustomers)} hint="Registered accounts" icon={Users} tone="blue" />
        <StatCard label="Sellers" value={loading ? '…' : formatNumber(stats.totalSellers)} hint={`${stats.activeSellers ?? 0} active`} icon={Store} tone="green" />
        <StatCard label="Products" value={loading ? '…' : formatNumber(stats.totalProducts)} hint="Live in storefront" icon={Package} tone="purple" />
        <StatCard label="Pending orders" value={loading ? '…' : formatNumber(stats.pendingOrders)} hint="Need confirmation" icon={Clock} tone="amber" />
        <StatCard label="Seller applications" value={loading ? '…' : formatNumber(stats.pendingSellerApplications)} hint="Awaiting review" icon={Store} tone="amber" />
        <StatCard label="Products to approve" value={loading ? '…' : formatNumber(stats.pendingProducts)} hint="Submitted listings" icon={Boxes} tone="amber" />
        <StatCard label="Cancelled orders" value={loading ? '…' : formatNumber(stats.cancelledOrders)} hint="For this period" icon={XCircle} tone="red" />
        <StatCard label="Low stock" value={loading ? '…' : formatNumber(stats.lowStockProducts)} hint="5 units or fewer" icon={AlertTriangle} tone="red" />
        <StatCard label="Delivered orders" value={loading ? '…' : formatNumber(stats.deliveredOrders)} hint="Completed fulfilment" icon={CheckCircle2} tone="green" />
        <StatCard label="Platform commission" value={loading ? '…' : formatMoney(stats.totalRevenue * 0.05)} hint="Estimated at 5%" icon={CreditCard} tone="slate" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Revenue trend" subtitle="Daily revenue for the selected period" className="xl:col-span-2">
          <LineChart data={data?.charts?.trend ?? []} />
        </Panel>
        <Panel title="Orders by status" subtitle="Share of orders in the selected period">
          <DonutChart data={data?.charts?.orderStatus ?? []} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Sales by category" subtitle="Revenue in USD">
          <BarChart data={data?.charts?.categorySales ?? []} label="revenue" />
        </Panel>
        <Panel title="Top sellers" subtitle="Revenue leaders in this period">
          <BarChart data={(data?.charts?.topSellers ?? []).map((seller) => ({ label: seller.label, value: Math.round(seller.revenue) }))} label="revenue" />
        </Panel>
        <div className="space-y-5">
          <Panel title="Progress" subtitle="Operational health">
            <div className="space-y-4">
              <ProgressBar label="Order fulfilment" value={stats.deliveredOrders ?? 0} total={stats.totalOrders ?? 0} hint="Delivered orders ÷ total orders" tone="#10B981" />
              <ProgressBar label="Product approvals" value={(stats.totalProducts ?? 0) - (stats.pendingProducts ?? 0)} total={(stats.totalProducts ?? 0) + (stats.pendingProducts ?? 0)} hint="Live listings ÷ submitted listings" />
              <ProgressBar label="Seller activation" value={stats.activeSellers ?? 0} total={stats.totalSellers ?? 0} hint="Active sellers ÷ registered sellers" tone="#FF6B00" />
            </div>
          </Panel>
          <Panel title="Low stock watch" subtitle="Restock these first">
            {(data?.charts?.lowStock ?? []).length === 0 && <p className="py-4 text-center text-sm text-muted">All products have healthy stock</p>}
            {(data?.charts?.lowStock ?? []).map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 border-b border-black/5 py-2.5 last:border-0 text-xs">
                <span className="truncate font-medium text-ink">{item.name}</span>
                <Badge tone="red">{item.stock} left</Badge>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-ink">Recent activity</h3>
            <p className="mt-1 text-xs text-muted">Administrative actions across the marketplace</p>
          </div>
          <Badge tone="purple">Live log</Badge>
        </div>
        <div className="space-y-1">
          {(data?.activity ?? []).length === 0 && <p className="py-8 text-center text-sm text-muted">No activity in this period</p>}
          {(data?.activity ?? []).map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-xl px-2 py-3 hover:bg-slate-50">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100"><ActivityIcon action={item.action} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">{item.summary}</p>
                <p className="mt-0.5 text-[11px] text-muted">{item.adminName} · {item.action} · {formatDate(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
