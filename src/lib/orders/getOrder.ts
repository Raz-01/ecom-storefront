import { prisma } from "@/lib/prisma";

/** An order with its line items, delivery zone and payment attempts — for the confirmation/status page, payment callbacks, and admin order detail. */
export function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      deliveryZone: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      deliveryZone: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}
