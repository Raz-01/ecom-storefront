import { prisma } from "@/lib/prisma";
import { restoreOrderStock } from "@/lib/orders/createOrder";

/**
 * Transitions an order to PAID. Idempotent: if the order is already PAID
 * (e.g. both the redirect-driven verify call and the webhook fire for the
 * same payment), this is a no-op rather than double-processing.
 */
export async function markOrderPaid(params: {
  orderNumber: string;
  paymentReference: string;
  paymentProvider: string;
}): Promise<void> {
  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber } });
  if (!order) throw new Error(`Order ${params.orderNumber} not found`);
  if (order.status === "PAID") return;

  // Only a PENDING_PAYMENT order should ever transition to PAID. A FAILED
  // or CANCELLED order that somehow gets a late success callback is left
  // alone and flagged via the thrown error for manual/ops follow-up rather
  // than silently marking money as received on a dead order.
  if (order.status !== "PENDING_PAYMENT") {
    throw new Error(`Cannot mark order ${params.orderNumber} as paid from status ${order.status}`);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentReference: params.paymentReference,
      paymentProvider: params.paymentProvider,
    },
  });
}

/** Transitions an order to PAYMENT_FAILED and releases its reserved stock. Idempotent. */
export async function markOrderFailed(params: {
  orderNumber: string;
  paymentReference: string;
  paymentProvider: string;
}): Promise<void> {
  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber } });
  if (!order) throw new Error(`Order ${params.orderNumber} not found`);
  if (order.status === "PAYMENT_FAILED" || order.status === "PAID") return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAYMENT_FAILED",
      paymentReference: params.paymentReference,
      paymentProvider: params.paymentProvider,
    },
  });

  await restoreOrderStock(order.id);
}
