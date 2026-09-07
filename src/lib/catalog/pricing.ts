export type BulkPriceTier = {
  minQuantity: number;
  pricePerUnitMinor: number;
};

export type PriceableProduct = {
  id: string;
  name: string;
  priceMinor: number;
  stock: number;
  isActive: boolean;
  minOrderQuantity: number;
  bulkQuoteThreshold: number | null;
  bulkPrices: BulkPriceTier[];
};

export type PriceResolution =
  | { kind: "priced"; unitPriceMinor: number; appliedTier: BulkPriceTier | null }
  /** Quantity is at/above `bulkQuoteThreshold` — no instant price; the customer should request a quote instead. */
  | { kind: "quote_required" };

/**
 * Resolves the per-unit price for a given quantity: the highest bulk-price
 * tier whose `minQuantity` is at or below the requested quantity, falling
 * back to the base `priceMinor` when no tier applies. If the quantity meets
 * or exceeds the product's `bulkQuoteThreshold`, no price is resolved at
 * all — the UI/checkout should route the customer to a quote request
 * instead of an instant price (see the project brief's "50+ bags → Request
 * bulk quote" example).
 */
export function resolveUnitPrice(product: PriceableProduct, quantity: number): PriceResolution {
  if (product.bulkQuoteThreshold != null && quantity >= product.bulkQuoteThreshold) {
    return { kind: "quote_required" };
  }

  const applicableTier = product.bulkPrices
    .filter((tier) => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  if (applicableTier) {
    return { kind: "priced", unitPriceMinor: applicableTier.pricePerUnitMinor, appliedTier: applicableTier };
  }
  return { kind: "priced", unitPriceMinor: product.priceMinor, appliedTier: null };
}
