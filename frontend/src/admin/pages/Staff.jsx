import { useCallback, useEffect, useState } from 'react'
import { Plus, ShieldCheck } from 'lucide-react'
import { adminFetch, formatDate } from '../lib/api'
import { Badge, Button, Card, DataTable, Field, Modal, Toast, inputClass, statusTone } from '../components/ui'

const emptyForm = { name: '', email: '', password: '', role: 'VIEWER', permissions: [] }

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [permissions, setPermissions] = useState([])
  const [form, setForm] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const [rows, options] = await Promise.all([adminFetch('/staff'), adminFetch('/auth/options')])
      setStaff(rows)
      setPermissions(options.permissions)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await adminFetch('/staff', { method: 'POST', body: form })
      setForm(null)
      setToast('Staff account created')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(person) {
    try {
      await adminFetch(`/staff/${person.id}`, { method: 'PATCH', body: { status: person.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } })
      setToast(person.status === 'ACTIVE' ? 'Staff account suspended' : 'Staff account activated')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (person) => <div><p className="font-semibold text-ink">{person.name}</p><p className="text-[11px] text-muted">{person.email}</p></div> },
    { key: 'role', label: 'Role', render: (person) => <Badge tone="purple">{person.role.replace('_', ' ')}</Badge> },
    { key: 'permissions', label: 'Permissions', render: (person) => <span className="text-xs text-muted">{person.permissions.length}</span> },
    { key: 'login', label: 'Last sign in', render: (person) => <span className="text-xs text-muted">{formatDate(person.lastLoginAt)}</span> },
    { key: 'status', label: 'Status', render: (person) => <Badge tone={statusTone(person.status)}>{person.status}</Badge> },
    {
      key: 'actions', label: 'Actions', className: 'text-right', render: (person) => (
        <button onClick={() => changeStatus(person)} disabled={person.role === 'SUPER_ADMIN'} className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold text-muted hover:text-ink disabled:opacity-40">
          {person.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Staff and permissions</h2>
          <p className="mt-1 text-sm text-muted">{staff.length} admin accounts · roles control access to sensitive sections</p>
        </div>
        <Button icon={Plus} onClick={() => setForm({ ...emptyForm })}>Add staff member</Button>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <Card><DataTable columns={columns} rows={staff} empty="No staff accounts" /></Card>

      {form && (
        <Modal title="Add staff member" subtitle="Super admins have every permission by default" onClose={() => setForm(null)}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} /></Field>
            <Field label="Email"><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} /></Field>
            <Field label="Temporary password" hint="Minimum 8 characters"><input required type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={inputClass} /></Field>
            <Field label="Role">
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={inputClass}>
                {['SUPER_ADMIN', 'MANAGER', 'SUPPORT', 'VIEWER'].map((role) => <option key={role} value={role}>{role.replace('_', ' ')}</option>)}
              </select>
            </Field>
            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-ink">Additional permissions</legend>
              <div className="grid max-h-36 grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border border-black/5 bg-canvas p-3">
                {permissions.map((permission) => (
                  <label key={permission} className="flex items-center gap-1.5 text-[11px] text-ink">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(permission)}
                      onChange={(event) => setForm({
                        ...form,
                        permissions: event.target.checked ? [...form.permissions, permission] : form.permissions.filter((item) => item !== permission),
                      })}
                      className="h-3.5 w-3.5 accent-purple-600"
                    />
                    {permission}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2 border-t border-black/5 pt-4">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" disabled={busy} icon={ShieldCheck}>{busy ? 'Saving…' : 'Create account'}</Button>
            </div>
          </form>
        </Modal>
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
