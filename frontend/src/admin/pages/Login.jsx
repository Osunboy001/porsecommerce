import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { adminFetch, setToken } from '../lib/api'
import { Button, Field, inputClass } from '../components/ui'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await adminFetch('/auth/login', { method: 'POST', body: { email, password } })
      setToken(data.token)
      onLogin(data.admin)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 font-display text-lg font-bold">P</span>
          <div>
            <p className="font-display text-base font-bold">Porse Marketplace</p>
            <p className="text-xs uppercase tracking-widest text-white/40">Admin console</p>
          </div>
        </div>
        <div>
          <h1 className="max-w-md font-display text-4xl font-bold leading-tight">Everything happening in your marketplace, in one place.</h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/50">Manage products, categories, sellers and customers with role-based access and a clear view of performance.</p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[['Products', '46+'], ['Sellers', 'Live'], ['Roles', '4']].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-display text-xl font-bold">{value}</p>
                <p className="mt-1 text-[11px] text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30">Protected session · JWT authentication</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-600 font-display text-base font-bold text-white lg:hidden">P</span>
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Sign in to admin</h2>
              <p className="mt-1 text-sm text-muted">Use your administrator account</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email address">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-muted" />
                <input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" className={`${inputClass} pl-10`} />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-muted" />
                <input type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className={`${inputClass} pl-10 pr-11`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-muted hover:text-ink" aria-label="Toggle password visibility">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full py-3">
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-purple-100 bg-purple-50 p-3.5 text-xs text-purple-800">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p>Credentials are created by <code className="font-mono">npm run db:seed</code>. Sessions expire after 8 hours.</p>
          </div>
          <a href="/" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"><ArrowLeft size={14} /> Back to storefront</a>
        </div>
      </div>
    </div>
  )
}
