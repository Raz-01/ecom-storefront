/** An item as held in the client-side cart — quantity only; price is never trusted from here. */
export type CartLine = {
  productId: string;
  quantity: number;
};

/** A cart line enriched with the current product data, for display purposes only. */
export type CartLineDisplay = CartLine & {
  name: string;
  slug: string;
  imageUrl: string | null;
  unitPriceMinor: number;
  stock: number;
  isActive: boolean;
};
