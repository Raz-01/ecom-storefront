"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env.server";
import { markPaymentSuccess, markPaymentFailed } from "@/lib/orders/confirmPayment";

function assertDemoMode() {
  if (!serverEnv.payments.isPaystackDemoMode) {
    throw new Error("The demo payment simulator is disabled because a real payment provider is configured.");
  }
}

async function getOrderNumberForReference(reference: string): Promise<string> {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { reference }, include: { order: true } });
  return payment.order.orderNumber;
}

/** Stands in for a successful Paystack checkout, for local dev/demo without real payment credentials. */
export async function simulateSuccess(reference: string) {
  assertDemoMode();
  const orderNumber = await getOrderNumberForReference(reference);
  const payment = await prisma.payment.findUniqueOrThrow({ where: { reference } });
  await markPaymentSuccess({ reference, amountMinor: payment.amountMinor });
  redirect(`/order/${orderNumber}`);
}

/** Stands in for a failed/abandoned Paystack checkout. */
export async function simulateFailure(reference: string) {
  assertDemoMode();
  const orderNumber = await getOrderNumberForReference(reference);
  await markPaymentFailed({ reference });
  redirect(`/order/${orderNumber}`);
}
