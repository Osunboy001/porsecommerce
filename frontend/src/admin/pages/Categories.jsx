import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { adminFetch, formatDate } from '../lib/api'
import { Badge, Button, Card, DataTable, Field, Modal, Toast, inputClass } from '../components/ui'

const emptyForm = { name: '', slug: '', description: '', imageUrl: '', parentId: '', subcategories: '', position: '0', active: true }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const rows = await adminFetch('/categories')
      setCategories(rows.filter((item) => `${item.name} ${item.slug}`.toLowerCase().includes(search.toLowerCase())))
    } catch (err) {
      setError(err.message)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, position: String(categories.length + 1) })
  }

  function openEdit(category) {
    setEditingId(category.id)
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      parentId: category.parentId ?? '',
      subcategories: category.subcategories.join(', '),
      position: String(category.position),
      active: category.active,
    })
  }

  function payload() {
    return {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      imageUrl: form.imageUrl || null,
      parentId: form.parentId || null,
      subcategories: form.subcategories.split(',').map((item) => item.trim()).filter(Boolean),
      position: Number(form.position),
      active: form.active,
    }
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (editingId) await adminFetch(`/categories/${editingId}`, { method: 'PATCH', body: payload() })
      else await adminFetch('/categories', { method: 'POST', body: payload() })
      setForm(null)
      setToast(editingId ? 'Category updated' : 'Category created')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(category) {
    try {
      await adminFetch(`/categories/${category.id}`, { method: 'PATCH', body: { active: !category.active } })
      setToast(category.active ? 'Category hidden' : 'Category visible')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(category) {
    if (!window.confirm(`Delete "${category.name}"? Products must be moved first.`)) return
    try {
      await adminFetch(`/categories/${category.id}`, { method: 'DELETE' })
      setToast('Category deleted')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    {
      key: 'name', label: 'Category', render: (category) => (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-purple-50 text-xs font-bold text-purple-600">
            {category.imageUrl ? <img src={category.imageUrl} alt="" className="h-full w-full object-cover" /> : category.name.charAt(0)}
          </div>
          <div><p className="font-semibold text-ink">{category.name}</p><p className="text-[11px] text-muted">/{category.slug} · created {formatDate(category.createdAt)}</p></div>
        </div>
      ),
    },
    { key: 'products', label: 'Products', render: (category) => <span className="font-semibold text-ink">{category.productCount}</span> },
    {
      key: 'subcategories', label: 'Subcategories', render: (category) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {category.subcategories.slice(0, 3).map((item) => <span key={item} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-muted">{item}</span>)}
          {category.subcategories.length > 3 && <span className="text-[11px] text-muted">+{category.subcategories.length - 3}</span>}
        </div>
      ),
    },
    { key: 'visibility', label: 'Visibility', render: (category) => <Badge tone={category.active ? 'green' : 'slate'}>{category.active ? 'Visible' : 'Hidden'}</Badge> },
    {
      key: 'actions', label: 'Actions', className: 'text-right', render: (category) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => toggleActive(category)} title="Toggle visibility" className="rounded-lg bg-purple-50 px-2.5 py-2 text-[11px] font-semibold text-purple-700 hover:bg-purple-100">{category.active ? 'Hide' : 'Show'}</button>
          <button onClick={() => openEdit(category)} title="Edit" className="rounded-lg bg-slate-100 p-2 text-muted hover:bg-purple-50 hover:text-purple-700"><Pencil size={15} /></button>
          <button onClick={() => remove(category)} title="Delete" className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Categories</h2>
          <p className="mt-1 text-sm text-muted">{categories.length} categories · organise products and subcategories</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add category</Button>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <Card className="p-4">
        <div className="flex max-w-sm items-center gap-2 rounded-xl border border-black/10 px-3.5 py-2.5">
          <Search size={16} className="text-muted" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories…" className="w-full bg-transparent text-sm outline-none" />
        </div>
      </Card>

      <Card><DataTable columns={columns} rows={categories} empty="No categories found" /></Card>

      {form && (
        <Modal title={editingId ? 'Edit category' : 'Add category'} subtitle="Subcategories are separated by commas" wide onClose={() => setForm(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} /></Field>
              <Field label="Slug"><input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className={inputClass} /></Field>
              <Field label="Image URL" className="sm:col-span-2"><input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://…" className={inputClass} /></Field>
              <Field label="Description" className="sm:col-span-2"><textarea rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} /></Field>
              <Field label="Parent category">
                <select value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })} className={inputClass}>
                  <option value="">None (top level)</option>
                  {categories.filter((item) => item.id !== editingId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </Field>
              <Field label="Position"><input type="number" min="0" value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} className={inputClass} /></Field>
              <Field label="Subcategories" className="sm:col-span-2"><input value={form.subcategories} onChange={(event) => setForm({ ...form, subcategories: event.target.value })} placeholder="Samsung, iPhone, Tecno" className={inputClass} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-4 w-4 accent-purple-600" />
              Visible in storefront
            </label>
            <div className="flex justify-end gap-2 border-t border-black/5 pt-4">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save category'}</Button>
            </div>
          </form>
        </Modal>
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
