import { prisma } from "@/lib/prisma";

/** Categories that have at least one active product, in a stable display order. */
export function getActiveCategories() {
  return prisma.category.findMany({
    where: { products: { some: { isActive: true } } },
    orderBy: { name: "asc" },
  });
}

/** Active products for the storefront grid, optionally filtered to one category by slug. */
export function getActiveProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

/** A single active product by slug, for the product detail page. Returns null if not found or inactive. */
export function getActiveProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true },
  });
}

/** Active delivery zones, for the checkout form's zone picker. */
export function getActiveDeliveryZones() {
  return prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { feeMinor: "asc" },
  });
}
