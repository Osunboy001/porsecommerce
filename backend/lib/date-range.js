export function resolveDateRange(range = '7d', from, to) {
  const now = new Date()
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  if (range === 'custom') {
    const start = from ? new Date(from) : null
    const end = to ? new Date(to) : null
    return {
      from: start && !Number.isNaN(start.getTime()) ? start : null,
      to: end && !Number.isNaN(end.getTime()) ? new Date(end.getTime() + 86399999) : null,
    }
  }

  if (range === 'today') return { from: startOfToday, to: now }
  if (range === '30d') return { from: new Date(startOfToday.getTime() - 29 * 86400000), to: now }
  if (range === 'month') return { from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), to: now }
  if (range === 'all') return { from: null, to: null }
  return { from: new Date(startOfToday.getTime() - 6 * 86400000), to: now }
}

export function inRange(date, range) {
  if (!date) return false
  const value = new Date(date)
  if (range.from && value < range.from) return false
  if (range.to && value > range.to) return false
  return true
}
