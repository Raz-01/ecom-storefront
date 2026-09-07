/** An item as held in the client-side cart — quantity only; price is never trusted from here, it's always resolved server-side at checkout. */
export type CartLine = {
  productId: string;
  quantity: number;
};
