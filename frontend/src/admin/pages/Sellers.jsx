import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Pencil, Plus, Search, Store, XCircle } from 'lucide-react'
import { adminFetch, formatDate, formatMoney } from '../lib/api'
import { Badge, Button, Card, DataTable, Field, Modal, Toast, inputClass, statusTone } from '../components/ui'

const emptyForm = { name: '', ownerName: '', email: '', phone: '', commissionRate: '5', status: 'PENDING' }

export default function Sellers() {
  const [sellers, setSellers] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const rows = await adminFetch('/sellers')
      setSellers(rows.filter((item) => {
        const matchesSearch = `${item.name} ${item.ownerName} ${item.email}`.toLowerCase().includes(search.toLowerCase())
        return matchesSearch && (status === 'ALL' || item.status === status)
      }))
    } catch (err) {
      setError(err.message)
    }
  }, [search, status])

  useEffect(() => { load() }, [load])

  async function changeStatus(seller, nextStatus) {
    try {
      await adminFetch(`/sellers/${seller.id}`, { method: 'PATCH', body: { status: nextStatus } })
      setToast(`${seller.name} set to ${nextStatus.toLowerCase()}`)
      if (profile?.id === seller.id) setProfile({ ...profile, status: nextStatus })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await adminFetch('/sellers', { method: 'POST', body: { ...form, commissionRate: Number(form.commissionRate) } })
      setForm(null)
      setToast('Seller added')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    {
      key: 'seller', label: 'Seller', render: (seller) => (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-700"><Store size={17} /></span>
          <div><p className="font-semibold text-ink">{seller.name}</p><p className="text-[11px] text-muted">{seller.ownerName || seller.email || '—'}</p></div>
        </div>
      ),
    },
    { key: 'products', label: 'Products', render: (seller) => <span className="font-semibold text-ink">{seller.productCount}</span> },
    { key: 'orders', label: 'Orders', render: (seller) => <span className="font-semibold text-ink">{seller.orderCount}</span> },
    { key: 'revenue', label: 'Revenue', render: (seller) => <span className="font-semibold text-ink">{formatMoney(seller.revenue)}</span> },
    { key: 'rating', label: 'Rating', render: (seller) => <span className="text-ink">★ {seller.rating.toFixed(1)}</span> },
    { key: 'status', label: 'Status', render: (seller) => <Badge tone={statusTone(seller.status)}>{seller.status}</Badge> },
    {
      key: 'actions', label: 'Actions', className: 'text-right', render: (seller) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => setProfile(seller)} title="View profile" className="rounded-lg bg-slate-100 px-2.5 py-2 text-[11px] font-semibold text-muted hover:text-ink">View</button>
          {seller.status === 'PENDING' && <button onClick={() => changeStatus(seller, 'ACTIVE')} title="Approve" className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><CheckCircle2 size={15} /></button>}
          {seller.status === 'ACTIVE' && <button onClick={() => changeStatus(seller, 'SUSPENDED')} title="Suspend" className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"><XCircle size={15} /></button>}
          {(seller.status === 'SUSPENDED' || seller.status === 'REJECTED') && <button onClick={() => changeStatus(seller, 'ACTIVE')} title="Reactivate" className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><CheckCircle2 size={15} /></button>}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Sellers</h2>
          <p className="mt-1 text-sm text-muted">{sellers.length} sellers · review applications and monitor performance</p>
        </div>
        <Button icon={Plus} onClick={() => setForm({ ...emptyForm })}>Add seller</Button>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-black/10 px-3.5 py-2.5">
            <Search size={16} className="text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sellers…" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={`${inputClass} w-auto min-w-40`}>
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending applications</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </Card>

      <Card><DataTable columns={columns} rows={sellers} empty="No sellers match these filters" /></Card>

      {profile && (
        <Modal title={profile.name} subtitle="Seller profile and performance" onClose={() => setProfile(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['Products', profile.productCount], ['Orders', profile.orderCount], ['Revenue', formatMoney(profile.revenue)], ['Rating', `★ ${profile.rating.toFixed(1)}`]].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-canvas p-3"><p className="text-[11px] text-muted">{label}</p><p className="mt-1 font-display text-base font-bold text-ink">{value}</p></div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span className="text-muted">Owner</span><span className="font-medium text-ink">{profile.ownerName || '—'}</span></p>
              <p className="flex justify-between"><span className="text-muted">Email</span><span className="font-medium text-ink">{profile.email || '—'}</span></p>
              <p className="flex justify-between"><span className="text-muted">Phone</span><span className="font-medium text-ink">{profile.phone || '—'}</span></p>
              <p className="flex justify-between"><span className="text-muted">Commission</span><span className="font-medium text-ink">{profile.commissionRate}%</span></p>
              <p className="flex justify-between"><span className="text-muted">Joined</span><span className="font-medium text-ink">{formatDate(profile.createdAt)}</span></p>
              <p className="flex justify-between"><span className="text-muted">Status</span><Badge tone={statusTone(profile.status)}>{profile.status}</Badge></p>
            </div>
            <div className="flex justify-end gap-2 border-t border-black/5 pt-4">
              {profile.status === 'PENDING' && <Button icon={CheckCircle2} onClick={() => changeStatus(profile, 'ACTIVE')}>Approve seller</Button>}
              {profile.status === 'ACTIVE' && <Button variant="danger" icon={XCircle} onClick={() => changeStatus(profile, 'SUSPENDED')}>Suspend</Button>}
              {(profile.status === 'SUSPENDED' || profile.status === 'REJECTED') && <Button icon={CheckCircle2} onClick={() => changeStatus(profile, 'ACTIVE')}>Reactivate</Button>}
            </div>
          </div>
        </Modal>
      )}

      {form && (
        <Modal title="Add seller" subtitle="New sellers start as pending applications" onClose={() => setForm(null)}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Store name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} /></Field>
            <Field label="Owner name"><input value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} className={inputClass} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email"><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} /></Field>
              <Field label="Phone"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={inputClass} /></Field>
            </div>
            <Field label="Commission rate (%)"><input type="number" min="0" max="100" value={form.commissionRate} onChange={(event) => setForm({ ...form, commissionRate: event.target.value })} className={inputClass} /></Field>
            <div className="flex justify-end gap-2 border-t border-black/5 pt-4">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" disabled={busy} icon={Pencil}>{busy ? 'Saving…' : 'Add seller'}</Button>
            </div>
          </form>
        </Modal>
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
