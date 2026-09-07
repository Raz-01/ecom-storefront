import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deductStockForOrder } from "@/lib/inventory/movements";

/**
 * Records a successful payment attempt (looked up by `Payment.reference`,
 * unique per attempt — not the order number, since an order can have more
 * than one attempt if an earlier one failed) and, the first time an order
 * reaches PAID, deducts inventory in the same transaction.
 *
 * Idempotent: the redirect-driven callback and the webhook can both fire
 * for the same payment, and a webhook can be retried by the provider —
 * none of that double-processes the order or double-deducts stock.
 */
export async function markPaymentSuccess(params: {
  reference: string;
  amountMinor: number;
  rawResponse?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      const payment = await tx.payment.findUnique({ where: { reference: params.reference } });
      if (!payment) throw new Error(`Payment ${params.reference} not found`);
      if (payment.status === "SUCCESS") return; // already processed

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", paidAt: new Date(), rawResponse: params.rawResponse },
      });

      const order = await tx.order.findUniqueOrThrow({ where: { id: payment.orderId } });
      if (order.status === "PAID") return; // a different payment attempt on this order already confirmed it

      if (order.status !== "PENDING_PAYMENT" && order.status !== "PAYMENT_PROCESSING") {
        // e.g. a CANCELLED order gets a late success callback. The payment
        // record above is still updated (the money is real and must be
        // accounted for), but we don't resurrect a dead order — that needs
        // manual ops follow-up, not a silent status flip.
        return;
      }

      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });

      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      await deductStockForOrder(tx, {
        orderId: order.id,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
    },
    { timeout: 15_000 }, // remote Postgres round-trips add up across several sequential queries
  );
}

/** Records a failed/abandoned payment attempt. The order itself stays PENDING_PAYMENT so the customer can retry with a fresh attempt. */
export async function markPaymentFailed(params: { reference: string; rawResponse?: Prisma.InputJsonValue }): Promise<void> {
  await prisma.payment.updateMany({
    where: { reference: params.reference, status: "PENDING" },
    data: { status: "FAILED", rawResponse: params.rawResponse },
  });
}
