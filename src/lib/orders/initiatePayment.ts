import type { Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { serverEnv } from "@/lib/env.server";

/**
 * Creates a `Payment` attempt for an order and hands off to the active
 * payment provider, returning the URL to send the customer to. Separate
 * from `createOrder` so a customer can retry payment on an existing
 * PENDING_PAYMENT order — a fresh attempt/reference — without re-creating
 * the order (and re-validating stock/pricing) from scratch.
 *
 * The reference is the order number for the first attempt, and
 * `<orderNumber>-RETRY-<n>` for each subsequent one, so every attempt has
 * a unique `Payment.reference` without the caller needing to track a
 * counter itself.
 */
export async function initiatePayment(order: Pick<Order, "id" | "orderNumber" | "totalMinor">, email: string) {
  const provider = getPaymentProvider();
  const priorAttempts = await prisma.payment.count({ where: { orderId: order.id } });
  const reference = priorAttempts === 0 ? order.orderNumber : `${order.orderNumber}-RETRY-${priorAttempts}`;

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: provider.name,
      reference,
      amountMinor: order.totalMinor,
      status: "PENDING",
    },
  });

  return provider.initializeTransaction({
    reference,
    amountMinor: order.totalMinor,
    email,
    callbackUrl: `${serverEnv.appUrl}/checkout/callback`,
  });
}
