import { prisma } from "@/lib/prisma";
import { restoreStockForOrder } from "@/lib/inventory/movements";

const STOCK_HOLDING_STATUSES = new Set(["PAID", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"]);

/**
 * Cancels an order. If it had already been paid (and therefore had stock
 * deducted), restores that stock — guarded by `stockRestored` so a repeat
 * cancel call is a no-op rather than double-crediting inventory.
 */
export async function cancelOrder(params: { orderId: string }): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: params.orderId } });
    if (order.status === "CANCELLED") return;

    const shouldRestoreStock = STOCK_HOLDING_STATUSES.has(order.status) && !order.stockRestored;

    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", stockRestored: shouldRestoreStock ? true : order.stockRestored },
    });

    if (shouldRestoreStock) {
      await restoreStockForOrder(tx, order.id);
    }
  });
}
