import { prisma } from "@/lib/prisma";

/** An order with its line items and delivery zone, for the confirmation/status page and payment callbacks. */
export function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, deliveryZone: true },
  });
}
