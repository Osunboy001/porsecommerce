import { prisma } from '../db/client.js'

const productInclude = {
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true, slug: true } },
  images: { orderBy: { position: 'asc' } },
  reviews: {
    where: { status: 'APPROVED' },
    select: { rating: true, title: true, body: true, createdAt: true },
  },
}

function serializeProduct(product) {
  const ratings = product.reviews.map((review) => review.rating)
  const rating = ratings.length
    ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
    : 0

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.priceCents / 100,
    compareAtPrice: product.compareAtPriceCents ? product.compareAtPriceCents / 100 : null,
    currency: product.currency,
    stock: product.stock,
    featured: product.featured,
    category: product.category,
    brand: product.brand,
    images: product.images.map((image) => image.url),
    rating,
    reviewCount: ratings.length,
    reviews: product.reviews,
  }
}

export async function findActiveProducts({ category } = {}) {
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      ...(category ? { category: { slug: category } } : {}),
    },
    include: productInclude,
    orderBy: [{ featured: 'desc' }, { createdAt: 'asc' }],
  })

  return products.map(serializeProduct)
}

export async function findActiveProductBySlug(slug) {
  const product = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: productInclude,
  })

  return product ? serializeProduct(product) : null
}
