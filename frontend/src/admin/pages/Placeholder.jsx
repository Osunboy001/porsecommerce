import { ArrowRight, Construction } from 'lucide-react'
import { Badge, Card } from '../components/ui'

export default function Placeholder({ title, phase, features }) {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <Card className="overflow-hidden">
        <div className="bg-ink px-8 py-10 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-600"><Construction size={22} /></span>
          <h2 className="mt-5 font-display text-2xl font-bold">{title}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">This area is planned for {phase} of the admin dashboard build. Core administration is live now: products, categories, sellers, customers and staff access.</p>
        </div>
        <div className="px-8 py-7">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted">Planned features</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 rounded-xl bg-canvas px-4 py-3 text-sm text-ink">
                <ArrowRight size={14} className="text-purple-600" />
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-6"><Badge tone="amber">{phase}</Badge></div>
        </div>
      </Card>
    </div>
  )
}
