import { Card } from './ui'

const palette = ['#7C4DFF', '#FF6B00', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#64748B']

export function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

export function LineChart({ data, label = 'Revenue' }) {
  const values = data.map((point) => point.revenue)
  const max = Math.max(...values, 1)
  const width = 640
  const height = 190
  const padding = { left: 8, right: 8, top: 12, bottom: 20 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const step = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth
  const points = data.map((point, index) => ({
    x: padding.left + index * step,
    y: padding.top + innerHeight - (point.revenue / max) * innerHeight,
    ...point,
  }))
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = points.length
    ? `M ${points[0].x} ${padding.top + innerHeight} L ${points.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${points[points.length - 1].x} ${padding.top + innerHeight} Z`
    : ''

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" role="img" aria-label={`${label} trend`}>
        {[0, 0.5, 1].map((ratio) => (
          <line key={ratio} x1={padding.left} x2={width - padding.right} y1={padding.top + ratio * innerHeight} y2={padding.top + ratio * innerHeight} stroke="#E9E9F0" strokeDasharray="4 5" />
        ))}
        {area && <path d={area} fill="url(#revenueFill)" />}
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length > 1 && <polyline points={line} fill="none" stroke="#7C4DFF" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((point) => (
          <circle key={point.date} cx={point.x} cy={point.y} r="3.5" fill="#fff" stroke="#7C4DFF" strokeWidth="2.5">
            <title>{`${point.date}: ${point.revenue.toLocaleString()} revenue, ${point.orders} orders`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between px-1 text-[11px] text-muted">
        <span>{data[0]?.date ?? ''}</span>
        <span>{data[Math.floor(data.length / 2)]?.date ?? ''}</span>
        <span>{data[data.length - 1]?.date ?? ''}</span>
      </div>
    </div>
  )
}

export function BarChart({ data, label = 'value' }) {
  const max = Math.max(...data.map((item) => item.value), 1)
  return (
    <div className="space-y-3.5">
      {data.length === 0 && <p className="py-8 text-center text-sm text-muted">No data for this period</p>}
      {data.map((item, index) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-ink">{item.label}</span>
            <span className="font-semibold text-muted">{label === 'revenue' ? `$${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : item.value}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(4, (item.value / max) * 100)}%`, backgroundColor: palette[index % palette.length] }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let start = 0
  const stops = data.map((item, index) => {
    const from = (start / Math.max(total, 1)) * 100
    start += item.value
    const to = (start / Math.max(total, 1)) * 100
    return `${palette[index % palette.length]} ${from}% ${to}%`
  }).join(', ')

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{ background: total ? `conic-gradient(${stops})` : '#EEF0F5' }}
      >
        <div className="absolute inset-[18px] grid place-items-center rounded-full bg-white text-center">
          <div>
            <p className="font-display text-xl font-bold text-ink">{total}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted">orders</p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.length === 0 && <p className="text-sm text-muted">No orders for this period</p>}
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-ink">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: palette[index % palette.length] }} />
              <span className="capitalize">{item.label.toLowerCase()}</span>
            </span>
            <span className="font-semibold text-muted">{total ? Math.round((item.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProgressBar({ label, value, total, hint, tone = '#7C4DFF' }) {
  const percent = total ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold text-ink">{label}</span>
        <span className="text-xs font-bold text-muted">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: tone }} />
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-muted">{hint}</p>}
    </div>
  )
}
