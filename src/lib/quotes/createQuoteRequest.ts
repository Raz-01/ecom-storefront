import { prisma } from "@/lib/prisma";
import { withUniqueReferenceRetry } from "@/lib/orders/referenceCode";
import type { QuoteRequestInput } from "@/lib/validation/checkout";

export class QuoteProductNotFoundError extends Error {
  constructor(public readonly productId: string) {
    super(`Product ${productId} not found`);
    this.name = "QuoteProductNotFoundError";
  }
}

/**
 * Creates a quote request. Unlike checkout, this never prices anything —
 * quotes exist precisely for quantities/situations that don't get an
 * instant price (see `bulkQuoteThreshold`), so all this does is snapshot
 * which products/quantities were asked about for the admin to act on.
 */
export async function createQuoteRequest(input: QuoteRequestInput) {
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productsById = new Map(products.map((p) => [p.id, p]));

  const items = input.items.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) throw new QuoteProductNotFoundError(item.productId);
    return { productId: product.id, productName: product.name, quantity: item.quantity };
  });

  return withUniqueReferenceRetry(
    (quoteNumber) =>
      prisma.quoteRequest.create({
        data: {
          quoteNumber,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerWhatsapp: input.customerWhatsapp,
          customerEmail: input.customerEmail || null,
          deliveryState: input.deliveryState || null,
          deliveryCity: input.deliveryCity || null,
          message: input.message || null,
          items: { create: items },
        },
        include: { items: true },
      }),
    "quoteNumber",
    "Q",
  );
}
