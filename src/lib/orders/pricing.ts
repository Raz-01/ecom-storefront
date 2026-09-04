import type { CartLine } from "@/types/domain";

export class OrderPricingError extends Error {
  constructor(
    message: string,
    /** Machine-readable reason, useful for mapping to a user-facing message. */
    public readonly code: "PRODUCT_UNAVAILABLE" | "INSUFFICIENT_STOCK" | "PRODUCT_NOT_FOUND",
    public readonly productId?: string,
  ) {
    super(message);
    this.name = "OrderPricingError";
  }
}

export type PriceableProduct = {
  id: string;
  name: string;
  priceMinor: number;
  stock: number;
  isActive: boolean;
};

export type PricedLine = {
  productId: string;
  productName: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
};

export type OrderTotals = {
  lines: PricedLine[];
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
};

/**
 * Recomputes order totals entirely from server-trusted data (current
 * product prices and stock, looked up by ID) — the client only ever
 * supplies product IDs and quantities. This is what keeps checkout honest
 * against a tampered client request.
 *
 * Throws `OrderPricingError` if any line is invalid (missing, inactive, or
 * insufficient stock) so the caller can surface a specific, actionable
 * error instead of silently mispricing the order.
 */
export function computeOrderTotals(
  cartLines: CartLine[],
  productsById: Map<string, PriceableProduct>,
  deliveryFeeMinor: number,
): OrderTotals {
  const lines: PricedLine[] = cartLines.map((line) => {
    const product = productsById.get(line.productId);

    if (!product) {
      throw new OrderPricingError(`Product ${line.productId} not found`, "PRODUCT_NOT_FOUND", line.productId);
    }
    if (!product.isActive) {
      throw new OrderPricingError(`${product.name} is no longer available`, "PRODUCT_UNAVAILABLE", product.id);
    }
    if (product.stock < line.quantity) {
      throw new OrderPricingError(
        `Only ${product.stock} of ${product.name} left in stock`,
        "INSUFFICIENT_STOCK",
        product.id,
      );
    }

    const lineTotalMinor = product.priceMinor * line.quantity;
    return {
      productId: product.id,
      productName: product.name,
      unitPriceMinor: product.priceMinor,
      quantity: line.quantity,
      lineTotalMinor,
    };
  });

  const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);
  const totalMinor = subtotalMinor + deliveryFeeMinor;

  return { lines, subtotalMinor, deliveryFeeMinor, totalMinor };
}
