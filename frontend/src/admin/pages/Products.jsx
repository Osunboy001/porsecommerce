import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-react'
import { adminFetch, formatDate, formatMoney } from '../lib/api'
import { Badge, Button, Card, DataTable, Field, Modal, Toast, inputClass, statusTone } from '../components/ui'

const emptyForm = {
  name: '', sku: '', shortDescription: '', description: '', price: '', stock: '10',
  categoryId: '', sellerId: '', image: '', badge: '', featured: false, status: 'PENDING',
}

export default function Products() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [sellers, setSellers] = useState([])
  const [form, setForm] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const search = params.get('q') ?? ''
  const status = params.get('status') ?? 'ALL'
  const category = params.get('category') ?? ''

  const load = useCallback(async () => {
    setError('')
    try {
      const query = new URLSearchParams()
      if (search) query.set('search', search)
      if (status !== 'ALL') query.set('status', status)
      if (category) query.set('category', category)
      const [productRows, categoryRows, sellerRows] = await Promise.all([
        adminFetch(`/products?${query}`),
        adminFetch('/categories'),
        adminFetch('/sellers'),
      ])
      setProducts(productRows)
      setCategories(categoryRows)
      setSellers(sellerRows)
    } catch (err) {
      setError(err.message)
    }
  }, [search, status, category])

  useEffect(() => { load() }, [load])

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value && !(key === 'status' && value === 'ALL')) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm })
  }

  function openEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      sku: product.sku,
      shortDescription: product.shortDescription,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId ?? '',
      sellerId: product.sellerId ?? '',
      image: product.images[0] ?? '',
      badge: product.badge ?? '',
      featured: product.featured,
      status: product.status,
    })
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId || undefined,
        sellerId: form.sellerId || undefined,
        compareAtPrice: undefined,
      }
      if (editingId) await adminFetch(`/products/${editingId}`, { method: 'PATCH', body: payload })
      else await adminFetch('/products', { method: 'POST', body: payload })
      setForm(null)
      setToast(editingId ? 'Product updated' : 'Product created')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(product, nextStatus) {
    try {
      await adminFetch(`/products/${product.id}/status`, { method: 'PATCH', body: { status: nextStatus } })
      setToast(`${product.name} set to ${nextStatus.toLowerCase()}`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(product) {
    if (!window.confirm(`Archive "${product.name}"? It will be hidden from the storefront.`)) return
    try {
      await adminFetch(`/products/${product.id}`, { method: 'DELETE' })
      setToast('Product archived')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    {
      key: 'product', label: 'Product', render: (product) => (
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100">
            {product.images[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] font-bold text-muted">IMG</span>}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{product.name}</p>
            <p className="mt-0.5 text-[11px] text-muted">SKU {product.sku || '—'} · added {formatDate(product.createdAt)}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category / Seller', render: (product) => <div><p className="text-ink">{product.category.name || 'Uncategorised'}</p><p className="mt-0.5 text-[11px] text-muted">{product.seller?.name ?? 'No seller'}</p></div> },
    { key: 'price', label: 'Price', render: (product) => <span className="font-semibold text-ink">{formatMoney(product.price)}</span> },
    { key: 'stock', label: 'Stock', render: (product) => <span className={product.stock <= 5 ? 'font-semibold text-rose-600' : 'text-ink'}>{product.stock}</span> },
    { key: 'status', label: 'Status', render: (product) => <Badge tone={statusTone(product.status)}>{product.status}</Badge> },
    {
      key: 'actions', label: 'Actions', className: 'text-right', render: (product) => (
        <div className="flex justify-end gap-1.5">
          {product.status === 'PENDING' && (
            <button onClick={() => changeStatus(product, 'ACTIVE')} title="Approve" className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><CheckCircle2 size={15} /></button>
          )}
          {product.status === 'ACTIVE' && (
            <button onClick={() => changeStatus(product, 'ARCHIVED')} title="Deactivate" className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"><XCircle size={15} /></button>
          )}
          {(product.status === 'REJECTED' || product.status === 'ARCHIVED') && (
            <button onClick={() => changeStatus(product, 'ACTIVE')} title="Restore" className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100"><CheckCircle2 size={15} /></button>
          )}
          <button onClick={() => openEdit(product)} title="Edit" className="rounded-lg bg-slate-100 p-2 text-muted hover:bg-purple-50 hover:text-purple-700"><Pencil size={15} /></button>
          <button onClick={() => remove(product)} title="Archive" className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Products</h2>
          <p className="mt-1 text-sm text-muted">{products.length} products in view · approve, edit or archive listings</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add product</Button>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 py-2.5">
            <Search size={16} className="text-muted" />
            <input value={search} onChange={(event) => updateParam('q', event.target.value)} placeholder="Search by name or SKU…" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={status} onChange={(event) => updateParam('status', event.target.value)} className={`${inputClass} w-auto min-w-36`}>
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending approval</option>
            <option value="REJECTED">Rejected</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select value={category} onChange={(event) => updateParam('category', event.target.value)} className={`${inputClass} w-auto min-w-44`}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
          </select>
        </div>
      </Card>

      <Card><DataTable columns={columns} rows={products} empty="No products match these filters" /></Card>

      {form && (
        <Modal
          title={editingId ? 'Edit product' : 'Add product'}
          subtitle="Submitted products stay pending until approved"
          wide
          onClose={() => setForm(null)}
        >
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} /></Field>
              <Field label="SKU"><input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} className={inputClass} /></Field>
              <Field label="Price (USD)"><input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={inputClass} /></Field>
              <Field label="Stock"><input required type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className={inputClass} /></Field>
              <Field label="Category">
                <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className={inputClass}>
                  <option value="">No category</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </Field>
              <Field label="Seller">
                <select value={form.sellerId} onChange={(event) => setForm({ ...form, sellerId: event.target.value })} className={inputClass}>
                  <option value="">No seller</option>
                  {sellers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </Field>
              <Field label="Image URL" className="sm:col-span-2"><input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="/products/aurora-lamp.svg" className={inputClass} /></Field>
              <Field label="Short description" className="sm:col-span-2"><input value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} className={inputClass} /></Field>
              <Field label="Description" className="sm:col-span-2"><textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} /></Field>
              <Field label="Badge"><input value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} placeholder="New, Bestseller…" className={inputClass} /></Field>
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={inputClass}>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} className="h-4 w-4 accent-purple-600" />
              Feature this product
            </label>
            <div className="flex justify-end gap-2 border-t border-black/5 pt-4">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}</Button>
            </div>
          </form>
        </Modal>
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
