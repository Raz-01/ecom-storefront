import { config } from "@/lib/config";
import { DemoPaymentProvider } from "@/lib/payments/demoProvider";
import { PaystackProvider } from "@/lib/payments/paystack";
import type { PaymentProvider } from "@/lib/payments/types";

let cachedProvider: PaymentProvider | undefined;

/** Returns the active payment provider — Paystack if real credentials are configured, otherwise the demo simulator. */
export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) return cachedProvider;

  cachedProvider = config.payments.isPaystackDemoMode
    ? new DemoPaymentProvider()
    : new PaystackProvider(config.payments.paystackSecretKey!);

  return cachedProvider;
}

export type { PaymentProvider } from "@/lib/payments/types";
