"use server";

import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { markOrderPaid, markOrderFailed } from "@/lib/orders/confirmPayment";

function assertDemoMode() {
  if (!config.payments.isPaystackDemoMode) {
    throw new Error("The demo payment simulator is disabled because a real payment provider is configured.");
  }
}

/** Stands in for a successful Paystack checkout, for local dev/demo without real payment credentials. */
export async function simulateSuccess(reference: string) {
  assertDemoMode();
  await markOrderPaid({ orderNumber: reference, paymentReference: reference, paymentProvider: "demo" });
  redirect(`/order/${reference}`);
}

/** Stands in for a failed/abandoned Paystack checkout. */
export async function simulateFailure(reference: string) {
  assertDemoMode();
  await markOrderFailed({ orderNumber: reference, paymentReference: reference, paymentProvider: "demo" });
  redirect(`/order/${reference}`);
}
