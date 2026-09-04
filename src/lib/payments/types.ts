/** Provider-agnostic payment abstraction so the app can swap in a real gateway without touching order/checkout code. */
export type InitializeTransactionInput = {
  /** Our internal order number, quoted to the customer and used to correlate the callback/webhook. */
  reference: string;
  amountMinor: number;
  email: string;
  /** Where the provider should redirect the customer after payment. */
  callbackUrl: string;
};

export type InitializeTransactionResult = {
  /** URL to redirect the customer to in order to pay. */
  authorizationUrl: string;
  reference: string;
};

export type VerifyTransactionResult =
  | { status: "success"; reference: string; amountMinor: number }
  | { status: "failed"; reference: string; reason: string }
  | { status: "pending"; reference: string };

export interface PaymentProvider {
  readonly name: string;
  initializeTransaction(input: InitializeTransactionInput): Promise<InitializeTransactionResult>;
  verifyTransaction(reference: string): Promise<VerifyTransactionResult>;
}
