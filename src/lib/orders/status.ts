import type { Order, PaymentStatus } from "@prisma/client";

/**
 * The admin UI shows "Payment status" and "Fulfillment status" as two
 * separate, clearly-labeled fields (per the project brief — never combine
 * them into one confusing field). Both are *derived* here from the single
 * `Order.status` state machine (plus the latest payment attempt's status),
 * rather than stored as two separate columns that could drift out of sync
 * with each other or with the order's actual state.
 */

export type DisplayPaymentStatus = "PENDING" | "PAID" | "FAILED";

export function getDisplayPaymentStatus(
  order: Pick<Order, "status">,
  latestPaymentStatus?: PaymentStatus,
): DisplayPaymentStatus {
  const paidStatuses: Order["status"][] = ["PAID", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED"];
  if (paidStatuses.includes(order.status)) return "PAID";
  if (latestPaymentStatus === "FAILED") return "FAILED";
  return "PENDING";
}

export type DisplayFulfillmentStatus =
  | "AWAITING_PAYMENT"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export function getDisplayFulfillmentStatus(order: Pick<Order, "status">): DisplayFulfillmentStatus {
  switch (order.status) {
    case "PENDING_PAYMENT":
    case "PAYMENT_PROCESSING":
      return "AWAITING_PAYMENT";
    case "PAID":
    case "PROCESSING":
      return "PROCESSING";
    case "READY_FOR_PICKUP":
      return "READY_FOR_PICKUP";
    case "OUT_FOR_DELIVERY":
      return "OUT_FOR_DELIVERY";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
  }
}

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  PENDING_PAYMENT: "Pending payment",
  PAYMENT_PROCESSING: "Payment processing",
  PAID: "Paid",
  PROCESSING: "Processing",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
