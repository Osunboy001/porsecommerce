export function readFilters(searchParams) {
  return {
    q: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
  }
}

export function writeFilters(searchParams, patch) {
  const next = new URLSearchParams(searchParams)
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value)
    else next.delete(key)
  }
  return next.toString()
}
