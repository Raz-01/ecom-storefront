import type { Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeOrderTotals, OrderPricingError, type PriceableProduct } from "@/lib/orders/pricing";
import { generateOrderNumber } from "@/lib/orders/orderNumber";
import type { CheckoutInput } from "@/lib/validation/checkout";

export class DeliveryZoneNotFoundError extends Error {
  constructor() {
    super("Selected delivery zone is not available");
    this.name = "DeliveryZoneNotFoundError";
  }
}

/**
 * Creates an order from a checkout submission.
 *
 * Runs inside a single DB transaction so pricing, stock validation, stock
 * decrement and order/line creation either all succeed or all roll back —
 * there is no window where stock is reserved without an order to match it,
 * or vice versa. Stock is decremented immediately at order creation
 * (rather than at payment confirmation) to prevent overselling while a
 * customer is mid-checkout; unpaid orders that are later cancelled or
 * abandoned restore their stock (see `restoreOrderStock`).
 */
export async function createOrder(input: CheckoutInput): Promise<Order> {
  return prisma.$transaction(async (tx) => {
    const deliveryZone = await tx.deliveryZone.findUnique({
      where: { id: input.deliveryZoneId },
    });
    if (!deliveryZone || !deliveryZone.isActive) {
      throw new DeliveryZoneNotFoundError();
    }

    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });
    const productsById = new Map<string, PriceableProduct>(products.map((p) => [p.id, p]));

    const totals = computeOrderTotals(input.items, productsById, deliveryZone.feeMinor);

    // Decrement stock, guarded by a WHERE clause so a concurrent order for
    // the same product can't oversell it — if another transaction already
    // consumed the stock, updatedCount will be 0 and we abort the order.
    for (const line of totals.lines) {
      const result = await tx.product.updateMany({
        where: { id: line.productId, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (result.count === 0) {
        const current = await tx.product.findUnique({ where: { id: line.productId } });
        throw new OrderPricingError(
          `Only ${current?.stock ?? 0} of ${line.productName} left in stock`,
          "INSUFFICIENT_STOCK",
          line.productId,
        );
      }
    }

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail || null,
        deliveryZoneId: deliveryZone.id,
        deliveryAddress: input.deliveryAddress,
        subtotalMinor: totals.subtotalMinor,
        deliveryFeeMinor: totals.deliveryFeeMinor,
        totalMinor: totals.totalMinor,
        status: "PENDING_PAYMENT",
        items: {
          create: totals.lines.map((line) => ({
            productId: line.productId,
            productName: line.productName,
            unitPriceMinor: line.unitPriceMinor,
            quantity: line.quantity,
            lineTotalMinor: line.lineTotalMinor,
          })),
        },
      },
    });

    return order;
  });
}

/**
 * Restores stock for an order whose payment failed or was cancelled.
 * Idempotent via the `stockRestored` flag — safe to call more than once
 * (e.g. if a webhook and a client-side poll both observe the failure).
 */
export async function restoreOrderStock(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.stockRestored) return;

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { stockRestored: true },
    });
  });
}

export { OrderPricingError };
