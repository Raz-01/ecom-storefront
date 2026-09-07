import { serverEnv } from "@/lib/env.server";
import { DemoPaymentProvider } from "@/lib/payments/demoProvider";
import { PaystackProvider } from "@/lib/payments/paystack";
import type { PaymentProvider } from "@/lib/payments/types";

let cachedProvider: PaymentProvider | undefined;

/** Returns the active payment provider — Paystack if real credentials are configured, otherwise the demo simulator. */
export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) return cachedProvider;

  cachedProvider = serverEnv.payments.isPaystackDemoMode
    ? new DemoPaymentProvider()
    : new PaystackProvider(serverEnv.payments.paystackSecretKey!);

  return cachedProvider;
}

export type { PaymentProvider } from "@/lib/payments/types";
