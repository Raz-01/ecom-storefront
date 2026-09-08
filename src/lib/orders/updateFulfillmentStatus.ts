import { prisma } from "@/lib/prisma";
import { cancelOrder } from "@/lib/orders/cancelOrder";

/**
 * Statuses an admin can set by hand. `PENDING_PAYMENT`, `PAYMENT_PROCESSING`
 * and `PAID` are deliberately excluded — those only ever change as a
 * consequence of an actual payment event (see `confirmPayment.ts`), never
 * a manual admin click, so inventory deduction stays tied to real money
 * received rather than something an admin form could fake.
 */
export const MANUAL_ORDER_STATUSES = ["PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"] as const;
export type ManualOrderStatus = (typeof MANUAL_ORDER_STATUSES)[number];

const PAID_ONWARD = new Set(["PAID", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED"]);

export class InvalidStatusTransitionError extends Error {}

export async function updateFulfillmentStatus(orderId: string, newStatus: ManualOrderStatus): Promise<void> {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

  if (newStatus === "CANCELLED") {
    await cancelOrder({ orderId });
    return;
  }

  if (!PAID_ONWARD.has(order.status)) {
    throw new InvalidStatusTransitionError(`Cannot set a fulfillment status on an order that hasn't been paid (current status: ${order.status})`);
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: newStatus } });
}
