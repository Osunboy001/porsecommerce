import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Search, UserRound, XCircle } from 'lucide-react'
import { adminFetch, formatDate, formatMoney, formatNumber } from '../lib/api'
import { Badge, Button, Card, DataTable, Modal, Toast, inputClass, statusTone } from '../components/ui'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status !== 'ALL') params.set('status', status)
      setCustomers(await adminFetch(`/customers?${params}`))
    } catch (err) {
      setError(err.message)
    }
  }, [search, status])

  useEffect(() => { load() }, [load])

  async function openProfile(customer) {
    setProfile(customer)
    setOrders([])
    try {
      setOrders(await adminFetch(`/customers/${customer.id}/orders`))
    } catch (err) {
      setError(err.message)
    }
  }

  async function changeStatus(customer, nextStatus) {
    try {
      const updated = await adminFetch(`/customers/${customer.id}`, { method: 'PATCH', body: { status: nextStatus } })
      setToast(`${customer.name} set to ${nextStatus.toLowerCase()}`)
      if (profile?.id === customer.id) setProfile(updated)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    {
      key: 'customer', label: 'Customer', render: (customer) => (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-700"><UserRound size={17} /></span>
          <div><p className="font-semibold text-ink">{customer.name}</p><p className="text-[11px] text-muted">{customer.email}</p></div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (customer) => <span className="text-muted">{customer.phone || '—'}</span> },
    { key: 'orders', label: 'Orders', render: (customer) => <span className="font-semibold text-ink">{formatNumber(customer.orderCount)}</span> },
    { key: 'spent', label: 'Total spent', render: (customer) => <span className="font-semibold text-ink">{formatMoney(customer.totalSpent)}</span> },
    { key: 'joined', label: 'Joined', render: (customer) => <span className="text-muted">{formatDate(customer.createdAt)}</span> },
    { key: 'status', label: 'Status', render: (customer) => <Badge tone={statusTone(customer.status)}>{customer.status}</Badge> },
    {
      key: 'actions', label: 'Actions', className: 'text-right', render: (customer) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => openProfile(customer)} title="View profile" className="rounded-lg bg-slate-100 px-2.5 py-2 text-[11px] font-semibold text-muted hover:text-ink">View</button>
          {customer.status === 'ACTIVE'
            ? <button onClick={() => changeStatus(customer, 'SUSPENDED')} title="Suspend" className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"><XCircle size={15} /></button>
            : <button onClick={() => changeStatus(customer, 'ACTIVE')} title="Reactivate" className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><CheckCircle2 size={15} /></button>}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Customers</h2>
        <p className="mt-1 text-sm text-muted">{customers.length} customers · search accounts, review history and manage access</p>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-black/10 px-3.5 py-2.5">
            <Search size={16} className="text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or phone…" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={`${inputClass} w-auto min-w-40`}>
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </Card>

      <Card><DataTable columns={columns} rows={customers} empty="No customers match these filters" /></Card>

      {profile && (
        <Modal title={profile.name} subtitle={profile.email} wide onClose={() => setProfile(null)}>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['Orders', formatNumber(profile.orderCount)], ['Total spent', formatMoney(profile.totalSpent)], ['Joined', formatDate(profile.createdAt)], ['Status', profile.status]].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-canvas p-3"><p className="text-[11px] text-muted">{label}</p><p className="mt-1 font-display text-sm font-bold text-ink">{value}</p></div>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-ink">Order history</h3>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-black/5">
                {orders.length === 0 && <p className="py-8 text-center text-sm text-muted">No orders yet</p>}
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 px-4 py-3 last:border-0 text-xs">
                    <span className="font-semibold text-ink">{order.orderNumber}</span>
                    <span className="text-muted">{formatDate(order.createdAt)}</span>
                    <span className="font-semibold text-ink">{formatMoney(order.total)}</span>
                    <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end border-t border-black/5 pt-4">
              {profile.status === 'ACTIVE'
                ? <Button variant="danger" icon={XCircle} onClick={() => changeStatus(profile, 'SUSPENDED')}>Suspend account</Button>
                : <Button icon={CheckCircle2} onClick={() => changeStatus(profile, 'ACTIVE')}>Reactivate account</Button>}
            </div>
          </div>
        </Modal>
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
