const TOKEN_KEY = 'porse_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function adminFetch(path, { method = 'GET', body, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`/api/admin${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  const data = await response.json().catch(() => ({}))
  if (response.status === 401 && !path.startsWith('/auth/login')) clearToken()
  if (!response.ok) throw new Error(data?.error ?? `Request failed (${response.status})`)
  return data
}

export function formatMoney(value) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value ?? 0)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
