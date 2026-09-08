import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Categories that have at least one active product, in a stable display order — for storefront nav/filtering. */
export function getActiveCategories() {
  return prisma.category.findMany({
    where: { products: { some: { isActive: true } } },
    orderBy: { name: "asc" },
  });
}

export function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name-asc";

export type ProductListFilter = {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  sort?: ProductSort;
};

const SORT_ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  "price-asc": [{ priceMinor: "asc" }],
  "price-desc": [{ priceMinor: "desc" }],
  "name-asc": [{ name: "asc" }],
};

/** Active products for the storefront shop grid, with optional category/search/featured filtering and sorting. */
export function getActiveProducts(filter: ProductListFilter = {}) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(filter.categorySlug ? { category: { slug: filter.categorySlug } } : {}),
      ...(filter.featuredOnly ? { isFeatured: true } : {}),
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: "insensitive" } },
              { brand: { contains: filter.search, mode: "insensitive" } },
              { sku: { contains: filter.search, mode: "insensitive" } },
              { category: { name: { contains: filter.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { category: true, bulkPrices: { orderBy: { minQuantity: "asc" } } },
    orderBy: SORT_ORDER_BY[filter.sort ?? "newest"],
  });
}

/** A single active product by slug, with its bulk-price tiers, for the product detail page. Null if not found or inactive. */
export function getActiveProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true, bulkPrices: { orderBy: { minQuantity: "asc" } } },
  });
}

/** Active delivery zones (Nigerian states with a configured fee), for the checkout state picker. */
export function getActiveDeliveryZones() {
  return prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { state: "asc" },
  });
}
