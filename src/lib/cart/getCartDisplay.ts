"use server";

import { prisma } from "@/lib/prisma";
import type { CartLine, CartLineDisplay } from "@/types/domain";

/**
 * Enriches client-held cart lines (productId + quantity only) with current
 * product data for display — name, price, image, stock, active status.
 * Called from the cart page (a client component, since it reads the
 * zustand store) whenever the cart changes. Lines whose product no longer
 * exists are silently dropped; the caller doesn't need to distinguish that
 * from an empty cart for display purposes.
 */
export async function getCartDisplay(lines: CartLine[]): Promise<CartLineDisplay[]> {
  if (lines.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) } },
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
        unitPriceMinor: product.priceMinor,
        stock: product.stock,
        isActive: product.isActive,
      },
    ];
  });
}
