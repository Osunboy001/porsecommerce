import { prisma } from '../db/client.js'

export async function findActiveCategories() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
  })

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl,
    parentId: category.parentId,
    subcategories: JSON.parse(category.subcategories),
  }))
}
