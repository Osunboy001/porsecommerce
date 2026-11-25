import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock3, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'

export default function Contact({ onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(`Thanks ${form.name.trim()}! Your message has been sent.`)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-ink">Home</Link>
        <ChevronRight size={13} />
        <span className="font-medium text-ink">Contact</span>
      </nav>

      <div className="mt-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Get in touch</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">We’re here to help</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Questions about a product, an order, or anything else? Send us a note and we’ll get back to you within one business day.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="rounded-4xl border border-black/[0.06] bg-white p-6 shadow-soft sm:p-8 lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              Your name
              <input
                required
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder="Amina K."
                className="mt-2 h-12 w-full rounded-2xl border border-black/[0.08] bg-canvas px-4 text-sm font-normal text-ink placeholder:text-muted/70 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Email address
              <input
                required
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-2xl border border-black/[0.08] bg-canvas px-4 text-sm font-normal text-ink placeholder:text-muted/70 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100"
              />
            </label>
          </div>
          <label className="mt-5 block text-sm font-semibold text-ink">
            Message
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={update('message')}
              placeholder="How can we help?"
              className="mt-2 w-full rounded-2xl border border-black/[0.08] bg-canvas p-4 text-sm font-normal text-ink placeholder:text-muted/70 focus:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100"
            />
          </label>
          <button type="submit" className="btn-primary mt-6">
            Send message <Send size={16} />
          </button>
        </form>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-soft">
            <MessageCircle size={22} className="text-purple-600" />
            <h2 className="mt-4 font-display text-lg font-bold text-ink">Talk to us</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-3"><Mail size={16} className="text-purple-500" /> hello@porsecommerce.com</li>
              <li className="flex items-center gap-3"><Phone size={16} className="text-purple-500" /> +1 555 123 4567</li>
              <li className="flex items-center gap-3"><MapPin size={16} className="text-purple-500" /> 123 Market Street, Lagos</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-soft">
            <Clock3 size={22} className="text-purple-600" />
            <h2 className="mt-4 font-display text-lg font-bold text-ink">Support hours</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">Monday to Friday, 9:00–18:00. We aim to reply within one business day.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
