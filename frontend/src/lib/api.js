const API_BASE = '/api'

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    throw new Error(message)
  }
  return response.json()
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price ?? 0)
}

export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function normalizeProduct(product) {
  const categoryName =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name ?? ''
  const categorySlug =
    typeof product.category === 'string'
      ? slugify(product.category)
      : product.category?.slug ?? slugify(categoryName)

  return {
    ...product,
    category: categoryName,
    categorySlug,
    image: product.images?.[0] ?? product.image ?? '',
    badge: product.badge ?? (product.featured ? 'Bestseller' : undefined),
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    details: product.details?.length
      ? product.details
      : [product.description, product.shortDescription].filter(Boolean),
    specs: product.specs?.length
      ? product.specs
      : [
          ...(product.brand?.name ? [{ label: 'Brand', value: product.brand.name }] : []),
          { label: 'Category', value: categoryName || '—' },
          { label: 'Stock', value: String(product.stock ?? 0) },
        ],
  }
}

export async function getCategories() {
  const data = await fetchJson('/categories')
  return data.map((category) => ({
    ...category,
    subcategories: Array.isArray(category.subcategories)
      ? category.subcategories
      : JSON.parse(category.subcategories || '[]'),
  }))
}

export async function getProducts() {
  const data = await fetchJson('/products')
  return data.map(normalizeProduct)
}
