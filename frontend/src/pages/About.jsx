import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Heart, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react'

const values = [
  { icon: Sparkles, title: 'Thoughtfully curated', description: 'Every piece is chosen for the way it feels in everyday use — not just how it looks on a shelf.' },
  { icon: ShieldCheck, title: 'Quality first', description: 'We work with materials and makers we trust, so the things you buy are made to last.' },
  { icon: PackageCheck, title: 'Simple delivery', description: 'Straightforward shipping and easy returns, with help available whenever you need it.' },
  { icon: Heart, title: 'Made for living', description: 'Maybe not perfect, but always considered — good things for the spaces you live in.' },
]

export default function About() {
  return (
    <main className="pb-24">
      <section className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-10">
        <div className="hero-glow relative overflow-hidden rounded-4xl px-7 py-16 text-white shadow-lift sm:px-14 sm:py-24">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember-500/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-300">Our story</p>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
              Considered things for everyday living.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              porsecommerce started with a simple idea: finding well-made, beautiful things shouldn’t be complicated.
              We bring together a small, carefully chosen collection for the way you actually live.
            </p>
          </div>
        </div>
      </section>

      <nav className="mx-auto flex max-w-7xl items-center gap-1.5 px-5 pt-6 text-xs text-muted sm:px-8" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-ink">Home</Link>
        <ChevronRight size={13} />
        <span className="font-medium text-ink">About</span>
      </nav>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">What we believe</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Good design should feel easy</h2>
        <p className="mt-4 leading-relaxed text-muted">
          We are a small team that cares about the details — the weight of a ceramic glaze, the way linen softens over time,
          the quiet of a well-made clock. Our catalogue is deliberately curated rather than endless, so you can spend less
          time searching and more time enjoying what you found.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {values.map((value) => (
            <div key={value.title} className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <value.icon size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-4xl bg-canvas p-8 sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Ready to explore?</h2>
            <p className="mt-2 text-sm text-muted">Browse the collection or get in touch — we’re happy to help.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary">Shop products <ArrowRight size={16} /></Link>
            <Link to="/contact" className="btn-ghost">Contact us</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
