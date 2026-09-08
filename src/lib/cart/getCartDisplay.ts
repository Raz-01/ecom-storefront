"use server";

import { prisma } from "@/lib/prisma";
import { resolveUnitPrice, type PriceResolution } from "@/lib/catalog/pricing";
import type { CartLine } from "@/types/cart";

export type CartLineDisplay = {
  productId: string;
  quantity: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  packageSize: string;
  basePriceMinor: number;
  stock: number;
  isActive: boolean;
  minOrderQuantity: number;
  priceResolution: PriceResolution;
};

/**
 * Enriches client-held cart lines (productId + quantity only) with current
 * product data and the resolved bulk-price tier for display — called from
 * the cart and checkout pages (client components, since they read the
 * zustand store) whenever the cart changes. Lines whose product no longer
 * exists are silently dropped; the caller doesn't need to distinguish that
 * from an empty cart for display purposes. This is purely for display —
 * checkout re-resolves everything server-side again in `createOrder`.
 */
export async function getCartDisplay(lines: CartLine[]): Promise<CartLineDisplay[]> {
  if (lines.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) } },
    include: { bulkPrices: true },
  });
  const productsById = new Map(products.map((p) => [p.id, p]));

  return lines.flatMap((line) => {
    const product = productsById.get(line.productId);
    if (!product) return [];
    return [
      {
        productId: product.id,
        quantity: line.quantity,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        packageSize: product.packageSize,
        basePriceMinor: product.priceMinor,
        stock: product.stock,
        isActive: product.isActive,
        minOrderQuantity: product.minOrderQuantity,
        priceResolution: resolveUnitPrice(product, line.quantity),
      },
    ];
  });
}
